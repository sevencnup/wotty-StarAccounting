package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/auth"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/config"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/database"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/httpapi"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/ledger"
)

func main() {
	logger := log.New(os.Stdout, "", log.LstdFlags|log.Lmicroseconds|log.LUTC)
	appConfig, err := config.Load(os.LookupEnv)
	if err != nil {
		logger.Fatalf("invalid configuration: %v", err)
	}

	store, dbErr := database.Open(appConfig.Database)
	if dbErr != nil {
		// Keep the health and version endpoints available when a deployment has
		// not been configured with a database yet, matching the Ktor service.
		logger.Printf("database unavailable; business endpoints will remain disabled: %v", dbErr)
	} else {
		defer store.Close()
	}

	authService := auth.NewService(store, auth.Config{
		JWTSecret:       appConfig.Auth.JWTSecret,
		AccountAdminKey: appConfig.Auth.AccountAdminKey,
	})
	ledgerService := ledger.NewService(store)

	server := &http.Server{
		Addr:              net.JoinHostPort(appConfig.Host, appConfig.PortString()),
		Handler:           httpapi.NewHandler(httpapi.Options{Database: store, Auth: authService, Ledger: ledgerService, Version: appConfig.Version, Logger: logger}),
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	serverErrors := make(chan error, 1)
	go func() {
		logger.Printf("Go API listening on http://%s", server.Addr)
		serverErrors <- server.ListenAndServe()
	}()

	stopSignals := make(chan os.Signal, 1)
	signal.Notify(stopSignals, syscall.SIGINT, syscall.SIGTERM)
	select {
	case signalValue := <-stopSignals:
		logger.Printf("received %s, shutting down", signalValue)
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			logger.Fatalf("HTTP server stopped unexpectedly: %v", err)
		}
	}

	shutdownContext, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownContext); err != nil {
		logger.Printf("graceful shutdown failed: %v", err)
	}
}
