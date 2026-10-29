package config

import (
	"fmt"
	"strconv"
	"strings"
)

const (
	defaultAPIHost   = "0.0.0.0"
	defaultAPIPort   = 12367
	defaultJWTSecret = "wotty-stark-development-secret-change-me"
)

// LookupEnv makes configuration parsing testable without changing process
// environment variables that may contain deployment secrets.
type LookupEnv func(string) (string, bool)

type Config struct {
	Host        string
	Port        int
	Database    DatabaseConfig
	Auth        AuthConfig
	Version     AppVersion
	KTWebVersion AppVersion
}

type DatabaseConfig struct {
	JDBCURL     string
	User        string
	Password    string
	MaxOpen     int
	MaxIdle     int
	AutoMigrate bool
	Configured  bool
	MissingKeys []string
}

type AppVersion struct {
	Code        int
	Name        string
	APKURL      *string
	Changelog   *string
	ForceUpdate bool
}

type AuthConfig struct {
	JWTSecret       string
	AccountAdminKey string
}

func (config Config) PortString() string {
	return strconv.Itoa(config.Port)
}

func Load(lookup LookupEnv) (Config, error) {
	value := func(name string) string {
		raw, exists := lookup(name)
		if !exists {
			return ""
		}
		return strings.TrimSpace(raw)
	}

	host := value("API_HOST")
	if host == "" {
		host = defaultAPIHost
	}

	port, err := integer(value("API_PORT"), defaultAPIPort, 1, 65535)
	if err != nil {
		return Config{}, fmt.Errorf("API_PORT: %w", err)
	}

	maxOpen, err := integer(value("DB_POOL_MAX_SIZE"), 10, 1, 50)
	if err != nil {
		return Config{}, fmt.Errorf("DB_POOL_MAX_SIZE: %w", err)
	}
	maxIdle, err := integer(value("DB_POOL_MIN_IDLE"), 1, 0, maxOpen)
	if err != nil {
		return Config{}, fmt.Errorf("DB_POOL_MIN_IDLE: %w", err)
	}

	databaseConfig := DatabaseConfig{
		JDBCURL:     value("DATABASE_URL"),
		User:        value("DB_USER"),
		Password:    value("DB_PASSWORD"),
		MaxOpen:     maxOpen,
		MaxIdle:     maxIdle,
		AutoMigrate: automaticSchemaMigration(value("DB_AUTO_MIGRATE")),
	}
	if databaseConfig.User == "" {
		databaseConfig.User = "root"
	}
	if databaseConfig.JDBCURL == "" {
		databaseConfig.MissingKeys = append(databaseConfig.MissingKeys, "DATABASE_URL")
	}
	if databaseConfig.Password == "" {
		databaseConfig.MissingKeys = append(databaseConfig.MissingKeys, "DB_PASSWORD")
	}
	databaseConfig.Configured = len(databaseConfig.MissingKeys) == 0

	versionCode, err := integer(value("APP_VERSION_CODE"), 107, 1, 1<<31-1)
	if err != nil {
		return Config{}, fmt.Errorf("APP_VERSION_CODE: %w", err)
	}
	versionName := value("APP_VERSION_NAME")
	if versionName == "" {
		versionName = "0.0.107"
	}
	ktWebVersionCode, err := integer(value("APP_KTWEB_VERSION_CODE"), versionCode, 1, 1<<31-1)
	if err != nil {
		return Config{}, fmt.Errorf("APP_KTWEB_VERSION_CODE: %w", err)
	}
	ktWebVersionName := value("APP_KTWEB_VERSION_NAME")
	if ktWebVersionName == "" {
		ktWebVersionName = versionName
	}

	jwtSecret := value("JWT_SECRET")
	if len(jwtSecret) < 32 {
		jwtSecret = defaultJWTSecret
	}

	return Config{
		Host:     host,
		Port:     port,
		Database: databaseConfig,
		Auth: AuthConfig{
			JWTSecret:       jwtSecret,
			AccountAdminKey: value("ACCOUNT_ADMIN_KEY"),
		},
		Version: AppVersion{
			Code:        versionCode,
			Name:        versionName,
			APKURL:      optional(value("APP_APK_URL")),
			Changelog:   optional(value("APP_CHANGELOG")),
			ForceUpdate: strings.EqualFold(value("APP_FORCE_UPDATE"), "true"),
		},
		KTWebVersion: AppVersion{
			Code:        ktWebVersionCode,
			Name:        ktWebVersionName,
			APKURL:      optional(value("APP_KTWEB_APK_URL")),
			Changelog:   optional(value("APP_KTWEB_CHANGELOG")),
			ForceUpdate: strings.EqualFold(value("APP_KTWEB_FORCE_UPDATE"), "true"),
		},
	}, nil
}

func automaticSchemaMigration(value string) bool {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "false", "0", "no", "off":
		return false
	default:
		return true
	}
}

func integer(raw string, fallback, minimum, maximum int) (int, error) {
	if raw == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("must be an integer")
	}
	if parsed < minimum || parsed > maximum {
		return 0, fmt.Errorf("must be between %d and %d", minimum, maximum)
	}
	return parsed, nil
}

func optional(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
