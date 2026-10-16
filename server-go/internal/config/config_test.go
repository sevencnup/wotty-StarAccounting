package config

import "testing"

func TestLoadMatchesCurrentAPIConfigurationDefaults(t *testing.T) {
	config, err := Load(func(string) (string, bool) { return "", false })
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if config.Host != "0.0.0.0" || config.Port != 12367 {
		t.Fatalf("server defaults = %q:%d", config.Host, config.Port)
	}
	if config.Database.Configured || len(config.Database.MissingKeys) != 2 || !config.Database.AutoMigrate {
		t.Fatalf("database configuration = %#v", config.Database)
	}
	if config.Version.Code != 107 || config.Version.Name != "0.0.107" || config.Version.ForceUpdate {
		t.Fatalf("version defaults = %#v", config.Version)
	}
}

func TestLoadUsesConfiguredValues(t *testing.T) {
	values := map[string]string{
		"API_HOST":         "10.0.0.5",
		"API_PORT":         "12369",
		"DATABASE_URL":     "jdbc:mysql://db:3306/stark",
		"DB_USER":          "accounting",
		"DB_PASSWORD":      "not-a-real-secret",
		"DB_POOL_MAX_SIZE": "12",
		"DB_POOL_MIN_IDLE": "2",
		"APP_VERSION_CODE": "119",
		"APP_VERSION_NAME": "0.0.119",
		"APP_FORCE_UPDATE": "TrUe",
	}
	config, err := Load(func(key string) (string, bool) { value, exists := values[key]; return value, exists })
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if !config.Database.Configured || config.Database.MaxOpen != 12 || config.Database.MaxIdle != 2 || !config.Database.AutoMigrate {
		t.Fatalf("database configuration = %#v", config.Database)
	}
	if config.Host != "10.0.0.5" || config.Port != 12369 || !config.Version.ForceUpdate {
		t.Fatalf("configured values = %#v", config)
	}
}

func TestLoadCanDisableAutomaticSchemaMigration(t *testing.T) {
	values := map[string]string{"DB_AUTO_MIGRATE": "off"}
	config, err := Load(func(key string) (string, bool) { value, exists := values[key]; return value, exists })
	if err != nil {
		t.Fatal(err)
	}
	if config.Database.AutoMigrate {
		t.Fatal("DB_AUTO_MIGRATE=off did not disable automatic migrations")
	}
}
