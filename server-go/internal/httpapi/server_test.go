package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/auth"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/config"
)

type fakeDatabase bool

func (database fakeDatabase) Ready(context.Context) bool { return bool(database) }

func TestHealthUsesDatabaseReadiness(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	recorder := httptest.NewRecorder()
	NewHandler(Options{Database: fakeDatabase(true)}).ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK || recorder.Body.String() != `{"status":"ok","db":true}` {
		t.Fatalf("health response = %d %q", recorder.Code, recorder.Body.String())
	}
}

func TestVersionOmitsKtorDefaultValues(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/app/version", nil)
	recorder := httptest.NewRecorder()
	NewHandler(Options{Version: config.AppVersion{Code: 119, Name: "0.0.119"}}).ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("version status = %d", recorder.Code)
	}
	for _, field := range []string{`"versionCode":119`, `"versionName":"0.0.119"`} {
		if !strings.Contains(recorder.Body.String(), field) {
			t.Fatalf("version response %q does not contain %s", recorder.Body.String(), field)
		}
	}
	for _, field := range []string{`"apkUrl"`, `"changelog"`, `"forceUpdate"`} {
		if strings.Contains(recorder.Body.String(), field) {
			t.Fatalf("version response should omit Ktor default %s: %q", field, recorder.Body.String())
		}
	}
}

func TestCORSPreflightNeedsNoRoute(t *testing.T) {
	request := httptest.NewRequest(http.MethodOptions, "/api/future-route", nil)
	recorder := httptest.NewRecorder()
	NewHandler(Options{}).ServeHTTP(recorder, request)
	if recorder.Code != http.StatusNoContent || recorder.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Fatalf("preflight = %d %#v", recorder.Code, recorder.Header())
	}
}

func TestAuthLoginAndProtectedMe(t *testing.T) {
	password, err := auth.HashPassword("correct-password")
	if err != nil {
		t.Fatal(err)
	}
	user := auth.User{
		ID: "user-1", Email: "person@example.com", Password: password, Role: "USER",
		CreatedAt: time.Date(2026, time.October, 5, 5, 0, 0, 0, time.UTC),
		UpdatedAt: time.Date(2026, time.October, 5, 5, 0, 0, 0, time.UTC),
	}
	service := auth.NewService(&httpAuthRepository{user: user, registrationEnabled: true}, auth.Config{JWTSecret: "12345678901234567890123456789012"})
	handler := NewHandler(Options{Database: fakeDatabase(true), Auth: service})

	loginRequest := httptest.NewRequest(http.MethodPost, "/api/auth/login", strings.NewReader(`{"email":"person@example.com","password":"correct-password"}`))
	loginRecorder := httptest.NewRecorder()
	handler.ServeHTTP(loginRecorder, loginRequest)
	if loginRecorder.Code != http.StatusOK {
		t.Fatalf("login = %d %s", loginRecorder.Code, loginRecorder.Body.String())
	}
	var response struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(loginRecorder.Body.Bytes(), &response); err != nil || response.Token == "" {
		t.Fatalf("login response = %q (%v)", loginRecorder.Body.String(), err)
	}

	meRequest := httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
	meRequest.Header.Set("Authorization", "Bearer "+response.Token)
	meRecorder := httptest.NewRecorder()
	handler.ServeHTTP(meRecorder, meRequest)
	if meRecorder.Code != http.StatusOK || !strings.Contains(meRecorder.Body.String(), `"id":"user-1"`) {
		t.Fatalf("me = %d %s", meRecorder.Code, meRecorder.Body.String())
	}
	if strings.Contains(meRecorder.Body.String(), `"name"`) || strings.Contains(meRecorder.Body.String(), `"defaultAccountId"`) {
		t.Fatalf("me response should omit absent optional fields: %s", meRecorder.Body.String())
	}
}

type httpAuthRepository struct {
	user                auth.User
	registrationEnabled bool
}

func (repository *httpAuthRepository) FindUserByID(_ context.Context, id string) (auth.User, error) {
	if id == repository.user.ID {
		return repository.user, nil
	}
	return auth.User{}, auth.ErrNotFound
}

func (repository *httpAuthRepository) FindUserByEmail(_ context.Context, email string) (auth.User, error) {
	if email == repository.user.Email {
		return repository.user, nil
	}
	return auth.User{}, auth.ErrNotFound
}

func (repository *httpAuthRepository) RegistrationEnabled(context.Context) (bool, error) {
	return repository.registrationEnabled, nil
}

func (repository *httpAuthRepository) SetRegistrationEnabled(_ context.Context, enabled bool) error {
	repository.registrationEnabled = enabled
	return nil
}

func (repository *httpAuthRepository) RegisterUser(context.Context, string, string, *string) (auth.User, error) {
	return auth.User{}, auth.ErrNotFound
}

func (repository *httpAuthRepository) UpdatePassword(_ context.Context, _, password string) error {
	repository.user.Password = password
	return nil
}
