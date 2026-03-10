# Sport Field Booking System

## Opis projekta

Sport Field Booking System je mikrostoritveni sistem za rezervacijo športnih igrišč.  
Uporabnikom omogoča registracijo, prijavo, pregled prostih terminov ter rezervacijo športnih igrišč prek spletne aplikacije.

Sistem je zasnovan po načelih mikrostoritvene arhitekture in čiste arhitekture (Clean Architecture), kjer je poslovna logika ločena od infrastrukturnih podrobnosti.

## Glavne funkcionalnosti

- registracija in prijava uporabnikov
- pregled športnih igrišč
- pregled prostih terminov
- ustvarjanje rezervacije
- preklic rezervacije
- pregled uporabnikovih rezervacij

## Arhitektura sistema

Sistem sestavljajo štiri glavne komponente:

### 1. User Service

Skrbi za uporabnike:

- registracija
- prijava
- upravljanje profila

### 2. Booking Service

Skrbi za rezervacije:

- ustvarjanje rezervacij
- preklic rezervacij
- pregled rezervacij

### 3. Availability Service

Skrbi za razpoložljivost terminov:

- preverjanje prostih terminov
- prikaz razpoložljivosti igrišč
- posodabljanje terminov glede na rezervacije

### 4. Web UI

Spletna aplikacija, prek katere uporabnik dostopa do sistema.

## Komunikacija med storitvami

Mikrostoritve komunicirajo prek jasno definiranih API-jev.  
Za asinhrono komunikacijo in prenos dogodkov se uporablja sporočilni posrednik.

Primer dogodkov:

- BookingCreated
- BookingCancelled

## Struktura repozitorija

```text
sport-field-booking-system/
├── README.md
├── .gitignore
├── docker-compose.yml
├── docs/
├── user-service/
├── booking-service/
├── availability-service/
├── web-ui/
└── message-broker/
```
