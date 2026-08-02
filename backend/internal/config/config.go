// Package config centralizes all environment-driven configuration.
//
// Why this exists:
//   Hardcoded configuration (explicitly on the project's "avoid" list)
//   makes a service impossible to run safely across dev/staging/prod.
//   Every tunable value — ports, DB URIs, secrets, mining difficulty — is
//   read once at startup, validated, and passed down as a plain struct.
//   Nothing else in the codebase calls os.Getenv directly; that keeps
//   configuration testable (construct a Config literal in a test) and
//   gives one place to see everything the service depends on.
package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all runtime configuration for the API service.
type Config struct {
	Env              string // "development" | "staging" | "production"
	HTTPPort         string
	MongoURI         string
	MongoDB          string
	JWTSecret        string
	MiningDifficulty int // required leading hex zeros in a valid block hash

	// AppURL is the publicly reachable base URL of the dashboard; it's
	// used to build password-reset links delivered by email.
	AppURL string

	// SMTP config for transactional email. When SMTPHost is empty the
	// mailer falls back to logging reset links (development).
	SMTPHost     string
	SMTPPort     int
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string
	SMTPInsecure bool
}

// Load reads configuration from environment variables, applying sane
// defaults for local development and failing fast if a production-critical
// value is missing.
func Load() (*Config, error) {
	cfg := &Config{
		Env:              getEnv("LF_ENV", "development"),
		HTTPPort:         getEnv("LF_HTTP_PORT", "8080"),
		MongoURI:         getEnv("LF_MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:          getEnv("LF_MONGO_DB", "ledgerforge"),
		JWTSecret:        getEnv("LF_JWT_SECRET", ""),
		MiningDifficulty: getEnvInt("LF_MINING_DIFFICULTY", 4),
		AppURL:           getEnv("LF_APP_URL", "http://localhost:5173"),
		SMTPHost:         getEnv("LF_SMTP_HOST", ""),
		SMTPPort:         getEnvInt("LF_SMTP_PORT", 587),
		SMTPUser:         getEnv("LF_SMTP_USER", ""),
		SMTPPassword:     getEnv("LF_SMTP_PASS", ""),
		SMTPFrom:         getEnv("LF_SMTP_FROM", "no-reply@ledgerforge.dev"),
		SMTPInsecure:     getEnvBool("LF_SMTP_INSECURE", false),
	}

	if cfg.Env == "production" && cfg.JWTSecret == "" {
		return nil, fmt.Errorf("config: LF_JWT_SECRET must be set in production")
	}
	if cfg.MiningDifficulty < 1 {
		return nil, fmt.Errorf("config: LF_MINING_DIFFICULTY must be >= 1, got %d", cfg.MiningDifficulty)
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvBool(key string, fallback bool) bool {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return parsed
}
