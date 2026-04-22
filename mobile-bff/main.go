package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

var (
	userServiceURL    = getEnv("USER_SERVICE_URL", "http://localhost:8080")
	bookingServiceURL = getEnv("BOOKING_SERVICE_URL", "http://localhost:3001")
	httpClient        = &http.Client{}
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "gateway": "mobile-bff"})
}

// POST /m/auth/login
func loginHandler(w http.ResponseWriter, r *http.Request) {
	proxyPost(w, r, userServiceURL+"/users/login", http.StatusOK)
}

// POST /m/auth/register
func registerHandler(w http.ResponseWriter, r *http.Request) {
	proxyPost(w, r, userServiceURL+"/users/register", http.StatusCreated)
}

// GET /m/fields/{fieldId}/slots?date=...
func fieldsHandler(w http.ResponseWriter, r *http.Request) {
	// Path: /m/fields/{fieldId}/slots
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	// parts: ["m", "fields", "{fieldId}", "slots"]
	if len(parts) < 4 || parts[3] != "slots" {
		http.Error(w, `{"error":"invalid path"}`, http.StatusBadRequest)
		return
	}
	fieldId := parts[2]
	date := r.URL.Query().Get("date")
	if date == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintln(w, `{"error":"date je obvezen"}`)
		return
	}
	target := fmt.Sprintf("%s/bookings/available?fieldId=%s&date=%s", bookingServiceURL, fieldId, date)
	proxyGet(w, target)
}

// /m/reservations  → POST create
// /m/reservations/user/{userId} → GET user's reservations
// /m/reservations/{id}  → DELETE/PATCH cancel
func reservationsHandler(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")
	// parts[0]="m", parts[1]="reservations", parts[2+]=rest

	switch {
	case len(parts) == 2 && r.Method == http.MethodPost:
		// POST /m/reservations
		proxyPost(w, r, bookingServiceURL+"/bookings", http.StatusCreated)

	case len(parts) == 4 && parts[2] == "user":
		// GET /m/reservations/user/{userId}
		if r.Method != http.MethodGet {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		proxyGet(w, bookingServiceURL+"/bookings/user/"+parts[3])

	case len(parts) == 3 && (r.Method == http.MethodDelete || r.Method == http.MethodPatch):
		// DELETE or PATCH /m/reservations/{id}
		proxyPatch(w, r, bookingServiceURL+"/bookings/"+parts[2]+"/cancel")

	default:
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	}
}

func proxyGet(w http.ResponseWriter, target string) {
	resp, err := httpClient.Get(target)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		http.Error(w, `{"error":"upstream error"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func proxyPost(w http.ResponseWriter, r *http.Request, target string, successCode int) {
	body, _ := io.ReadAll(r.Body)
	resp, err := httpClient.Post(target, "application/json", strings.NewReader(string(body)))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		http.Error(w, `{"error":"upstream error"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Type", "application/json")
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		w.WriteHeader(successCode)
	} else {
		w.WriteHeader(resp.StatusCode)
	}
	io.Copy(w, resp.Body)
}

func proxyPatch(w http.ResponseWriter, r *http.Request, target string) {
	body, _ := io.ReadAll(r.Body)
	req, err := http.NewRequest(http.MethodPatch, target, strings.NewReader(string(body)))
	if err != nil {
		http.Error(w, `{"error":"bad request"}`, http.StatusBadRequest)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	if err != nil {
		http.Error(w, `{"error":"upstream error"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func setupRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/m/auth/login", loginHandler)
	mux.HandleFunc("/m/auth/register", registerHandler)
	mux.HandleFunc("/m/fields/", fieldsHandler)
	mux.HandleFunc("/m/reservations", func(w http.ResponseWriter, r *http.Request) {
		reservationsHandler(w, r)
	})
	mux.HandleFunc("/m/reservations/", func(w http.ResponseWriter, r *http.Request) {
		reservationsHandler(w, r)
	})
	return mux
}

func main() {
	port := getEnv("PORT", "5000")
	log.Printf("Mobile BFF running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, setupRouter()))
}
