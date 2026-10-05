package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/config"
)

type fakeDatabase bool

func (database fakeDatabase) Ready(context.Context) bool { return bool(database) }

func TestHealthUsesDatabaseReadiness(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	recorder := httptest.NewRecorder()
	NewHandler(Options{Database: fakeDatabase(true)}).ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK || strings.TrimSpace(recorder.Body.String()) != `{"status":"ok","db":true}` {
		t.Fatalf("health response = %d %q", recorder.Code, recorder.Body.String())
	}
}

func TestVersionMatchesExistingJSONFieldNames(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/app/version", nil)
	recorder := httptest.NewRecorder()
	NewHandler(Options{Version: config.AppVersion{Code: 119, Name: "0.0.119"}}).ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("version status = %d", recorder.Code)
	}
	for _, field := range []string{`"versionCode":119`, `"versionName":"0.0.119"`, `"apkUrl":null`, `"changelog":null`, `"forceUpdate":false`} {
		if !strings.Contains(recorder.Body.String(), field) {
			t.Fatalf("version response %q does not contain %s", recorder.Body.String(), field)
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
