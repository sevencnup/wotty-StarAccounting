package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/auth"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/config"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/ledger"
)

type HealthChecker interface {
	Ready(context.Context) bool
}

type Options struct {
	Database HealthChecker
	Auth     *auth.Service
	Ledger   *ledger.Service
	Version  config.AppVersion
	Logger   *log.Logger
}

type healthResponse struct {
	Status string `json:"status"`
	DB     bool   `json:"db"`
}

type versionResponse struct {
	VersionCode int     `json:"versionCode"`
	VersionName string  `json:"versionName"`
	APKURL      *string `json:"apkUrl,omitempty"`
	Changelog   *string `json:"changelog,omitempty"`
	ForceUpdate bool    `json:"forceUpdate,omitempty"`
}

func NewHandler(options Options) http.Handler {
	router := chi.NewRouter()
	router.Use(recoverer(options.Logger))
	router.Use(cors)
	router.Get("/api/health", func(writer http.ResponseWriter, request *http.Request) {
		ready := options.Database != nil && options.Database.Ready(request.Context())
		writeJSON(writer, http.StatusOK, healthResponse{Status: "ok", DB: ready})
	})
	router.Get("/api/app/version", func(writer http.ResponseWriter, request *http.Request) {
		writeJSON(writer, http.StatusOK, versionResponse{
			VersionCode: options.Version.Code,
			VersionName: options.Version.Name,
			APKURL:      options.Version.APKURL,
			Changelog:   options.Version.Changelog,
			ForceUpdate: options.Version.ForceUpdate,
		})
	})
	registerAuthRoutes(router, options.Auth)
	registerLedgerRoutes(router, options.Auth, options.Ledger)
	router.NotFound(func(writer http.ResponseWriter, request *http.Request) {
		writeJSON(writer, http.StatusNotFound, map[string]string{"error": "Not found"})
	})
	return router
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Access-Control-Allow-Origin", "*")
		writer.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if request.Method == http.MethodOptions {
			writer.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(writer, request)
	})
}

func recoverer(logger *log.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			defer func() {
				if recovered := recover(); recovered != nil {
					if logger != nil {
						logger.Printf("request failed: %s %s: %v", request.Method, request.URL.Path, recovered)
					}
					writeJSON(writer, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
				}
			}()
			next.ServeHTTP(writer, request)
		})
	}
}

func writeJSON(writer http.ResponseWriter, status int, value interface{}) {
	var encoded bytes.Buffer
	encoder := json.NewEncoder(&encoded)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(value); err != nil {
		writeJSONEncodingFailure(writer)
		return
	}
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(status)
	_, _ = writer.Write(bytes.TrimSuffix(encoded.Bytes(), []byte{'\n'}))
}

func writeJSONEncodingFailure(writer http.ResponseWriter) {
	if writer.Header().Get("Content-Type") != "" {
		return
	}
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(http.StatusInternalServerError)
	_, _ = writer.Write([]byte(`{"error":"Internal server error"}`))
}
