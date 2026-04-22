package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	healthHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal("failed to decode response")
	}
	if body["status"] != "ok" {
		t.Errorf("expected status=ok, got %s", body["status"])
	}
	if body["gateway"] != "mobile-bff" {
		t.Errorf("expected gateway=mobile-bff, got %s", body["gateway"])
	}
}

func TestLoginHandler_ProxiesToUpstream(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/users/login" {
			http.Error(w, "wrong path", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"id": 1, "email": "test@test.com"})
	}))
	defer upstream.Close()

	orig := userServiceURL
	userServiceURL = upstream.URL
	defer func() { userServiceURL = orig }()

	body := strings.NewReader(`{"email":"test@test.com","password":"pass"}`)
	req := httptest.NewRequest(http.MethodPost, "/m/auth/login", body)
	w := httptest.NewRecorder()
	loginHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestRegisterHandler_Returns201(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{"id": 5, "username": "novuser"})
	}))
	defer upstream.Close()

	orig := userServiceURL
	userServiceURL = upstream.URL
	defer func() { userServiceURL = orig }()

	body := strings.NewReader(`{"username":"novuser","email":"nov@test.com","password":"pass"}`)
	req := httptest.NewRequest(http.MethodPost, "/m/auth/register", body)
	w := httptest.NewRecorder()
	registerHandler(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d", w.Code)
	}
}

func TestFieldsHandler_ReturnsSlotsFromUpstream(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]string{{"id": "s1", "timeSlot": "10:00-11:00"}})
	}))
	defer upstream.Close()

	orig := bookingServiceURL
	bookingServiceURL = upstream.URL
	defer func() { bookingServiceURL = orig }()

	req := httptest.NewRequest(http.MethodGet, "/m/fields/field1/slots?date=2026-05-01", nil)
	w := httptest.NewRecorder()
	fieldsHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestFieldsHandler_MissingDate_Returns400(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/m/fields/field1/slots", nil)
	w := httptest.NewRecorder()
	fieldsHandler(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestReservationsHandler_CreateReservation(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"id": "b1", "status": "CONFIRMED"})
	}))
	defer upstream.Close()

	orig := bookingServiceURL
	bookingServiceURL = upstream.URL
	defer func() { bookingServiceURL = orig }()

	body := strings.NewReader(`{"userId":"u1","fieldId":"f1","date":"2026-05-01","timeSlot":"10:00-11:00"}`)
	req := httptest.NewRequest(http.MethodPost, "/m/reservations", body)
	w := httptest.NewRecorder()
	reservationsHandler(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d", w.Code)
	}
}

func TestReservationsHandler_UserReservations(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]string{{"id": "b1"}})
	}))
	defer upstream.Close()

	orig := bookingServiceURL
	bookingServiceURL = upstream.URL
	defer func() { bookingServiceURL = orig }()

	req := httptest.NewRequest(http.MethodGet, "/m/reservations/user/u1", nil)
	w := httptest.NewRecorder()
	reservationsHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestSetupRouter_RegistersRoutes(t *testing.T) {
	mux := setupRouter()
	routes := []struct {
		method string
		path   string
	}{
		{http.MethodGet, "/health"},
		{http.MethodPost, "/m/auth/login"},
		{http.MethodPost, "/m/auth/register"},
	}
	for _, r := range routes {
		req := httptest.NewRequest(r.method, r.path, nil)
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, req)
		if w.Code == http.StatusNotFound {
			t.Errorf("route %s %s not found in mux", r.method, r.path)
		}
	}
}
