package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/config"
)

type Store struct {
	db *sql.DB
}

var ErrUnavailable = errors.New("database unavailable")

func Open(settings config.DatabaseConfig) (*Store, error) {
	if !settings.Configured {
		return nil, fmt.Errorf("missing database setting: %s", strings.Join(settings.MissingKeys, ", "))
	}

	dsn, err := BuildDSN(settings.JDBCURL, settings.User, settings.Password)
	if err != nil {
		return nil, err
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("open MySQL connection: %w", err)
	}
	db.SetMaxOpenConns(settings.MaxOpen)
	db.SetMaxIdleConns(settings.MaxIdle)
	db.SetConnMaxIdleTime(30 * time.Second)
	db.SetConnMaxLifetime(10 * time.Minute)

	context, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(context); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping MySQL: %w", err)
	}
	return &Store{db: db}, nil
}

func (store *Store) Ready(requestContext context.Context) bool {
	if store == nil || store.db == nil {
		return false
	}
	probeContext, cancel := context.WithTimeout(requestContext, 2*time.Second)
	defer cancel()
	return store.db.PingContext(probeContext) == nil
}

func (store *Store) Close() error {
	if store == nil || store.db == nil {
		return nil
	}
	return store.db.Close()
}

func (store *Store) connection() (*sql.DB, error) {
	if store == nil || store.db == nil {
		return nil, ErrUnavailable
	}
	return store.db, nil
}

// BuildDSN converts the JDBC URL already used by the Ktor service into the
// native driver representation without logging or exposing credentials.
func BuildDSN(jdbcURL, username, password string) (string, error) {
	const jdbcPrefix = "jdbc:"
	if !strings.HasPrefix(jdbcURL, jdbcPrefix) {
		return "", errors.New("DATABASE_URL must start with jdbc:")
	}
	parsed, err := url.Parse(strings.TrimPrefix(jdbcURL, jdbcPrefix))
	if err != nil {
		return "", fmt.Errorf("parse DATABASE_URL: %w", err)
	}
	if parsed.Scheme != "mysql" || parsed.Host == "" {
		return "", errors.New("DATABASE_URL must be a jdbc:mysql URL with host")
	}
	databaseName := strings.Trim(parsed.EscapedPath(), "/")
	if databaseName == "" {
		return "", errors.New("DATABASE_URL must include a database name")
	}
	databaseName, err = url.PathUnescape(databaseName)
	if err != nil {
		return "", fmt.Errorf("decode database name: %w", err)
	}

	driverConfig := mysql.NewConfig()
	driverConfig.User = username
	driverConfig.Passwd = password
	driverConfig.Net = "tcp"
	driverConfig.Addr = parsed.Host
	driverConfig.DBName = databaseName
	driverConfig.ParseTime = true
	driverConfig.Params = map[string]string{"charset": "utf8mb4"}
	return driverConfig.FormatDSN(), nil
}
