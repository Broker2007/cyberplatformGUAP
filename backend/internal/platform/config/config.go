package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"
)

type AppConfig struct {
	Env  string
	Name string
}

type HTTPConfig struct {
	Host           string
	Port           string
	AllowedOrigins []string
	CookieDomain   string
	CookieSecure   bool
}

type MinIOConfig struct {
	InternalSecure   bool
	InternalEndpoint string
	PublicEndpoint   string
	PublicSecure     bool
	AccessKey        string
	SecretKey        string
	AvatarsBucket    string
	ImagesBucket     string
}

// Addr возвращает host:port для gin.
func (h HTTPConfig) Addr() string {
	if h.Host == "" {
		return ":" + h.Port
	}
	return h.Host + ":" + h.Port
}

type DBConfig struct {
	DSN string
}

type AuthConfig struct {
	JWTSecret  string
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}

type SSOConfig struct {
	Issuer   string
	CodeTTL  time.Duration
	TokenTTL time.Duration
}

type Config struct {
	App   AppConfig
	HTTP  HTTPConfig
	DB    DBConfig
	Auth  AuthConfig
	MinIO MinIOConfig
	SSO   SSOConfig
}

func MustLoad() *Config {
	cfg, err := Load()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}
	return cfg
}

func Load() (*Config, error) {
	cfg := &Config{}

	// ----- APP -----
	cfg.App.Env = getEnv("APP_ENV", "local")
	cfg.App.Name = getEnv("APP_NAME", "CyberPlatform")

	// ----- HTTP -----
	cfg.HTTP.Host = getEnv("HTTP_HOST", "0.0.0.0")
	cfg.HTTP.Port = getEnv("HTTP_PORT", "8080")
	origins := getEnv("HTTP_ALLOWED_ORIGINS", "http://localhost:3000")
	cfg.HTTP.AllowedOrigins = strings.Split(origins, ",")

	cfg.HTTP.CookieDomain = getEnv("HTTP_COOKIE_DOMAIN", "localhost")

	cookieSecureStr := getEnv("HTTP_COOKIE_SECURE", "false")
	cfg.HTTP.CookieSecure = cookieSecureStr == "true"

	// ----- DB -----
	cfg.DB.DSN = os.Getenv("DB_DSN")
	if cfg.DB.DSN == "" {
		return nil, fmt.Errorf("DB_DSN is required")
	}

	// ----- AUTH / JWT -----
	cfg.Auth.JWTSecret = os.Getenv("AUTH_JWT_SECRET")
	if cfg.Auth.JWTSecret == "" {
		return nil, fmt.Errorf("AUTH_JWT_SECRET is required")
	}

	accessTTLMinStr := getEnv("AUTH_ACCESS_TTL_MIN", "15")
	refreshTTLDaysStr := getEnv("AUTH_REFRESH_TTL_DAYS", "14")

	accessMin, err := strconv.Atoi(accessTTLMinStr)
	if err != nil {
		return nil, fmt.Errorf("invalid AUTH_ACCESS_TTL_MIN=%q: %w", accessTTLMinStr, err)
	}
	refreshDays, err := strconv.Atoi(refreshTTLDaysStr)
	if err != nil {
		return nil, fmt.Errorf("invalid AUTH_REFRESH_TTL_DAYS=%q: %w", refreshTTLDaysStr, err)
	}

	cfg.Auth.AccessTTL = time.Duration(accessMin) * time.Minute
	cfg.Auth.RefreshTTL = time.Duration(refreshDays) * 24 * time.Hour

	// ----- SSO -----
	cfg.SSO.Issuer = getEnv("SSO_ISSUER", "cyberplatform-sso")

	ssoCodeTTLMinStr := getEnv("SSO_CODE_TTL_MIN", "5")
	ssoTokenTTLMinStr := getEnv("SSO_TOKEN_TTL_MIN", "15")

	ssoCodeTTLMin, err := strconv.Atoi(ssoCodeTTLMinStr)
	if err != nil {
		return nil, fmt.Errorf("invalid SSO_CODE_TTL_MIN=%q: %w", ssoCodeTTLMinStr, err)
	}

	ssoTokenTTLMin, err := strconv.Atoi(ssoTokenTTLMinStr)
	if err != nil {
		return nil, fmt.Errorf("invalid SSO_TOKEN_TTL_MIN=%q: %w", ssoTokenTTLMinStr, err)
	}

	cfg.SSO.CodeTTL = time.Duration(ssoCodeTTLMin) * time.Minute
	cfg.SSO.TokenTTL = time.Duration(ssoTokenTTLMin) * time.Minute

	// MinIO
	cfg.MinIO.InternalEndpoint = getEnv("MINIO_INTERNAL_ENDPOINT", "minio:9000")
	internalSecure := getEnv("MINIO_INTERNAL_USE_SSL", "false")
	cfg.MinIO.InternalSecure = internalSecure == "true"

	cfg.MinIO.PublicEndpoint = os.Getenv("MINIO_PUBLIC_ENDPOINT")
	publicSecure := getEnv("MINIO_PUBLIC_USE_SSL", "true")
	cfg.MinIO.PublicSecure = publicSecure == "true"
	cfg.MinIO.AccessKey = os.Getenv("MINIO_ACCESS_KEY")
	cfg.MinIO.SecretKey = os.Getenv("MINIO_SECRET_KEY")
	cfg.MinIO.AvatarsBucket = getEnv("MINIO_AVATARS_BUCKET", "avatars")
	cfg.MinIO.ImagesBucket = getEnv("MINIO_IMAGES_BUCKET", "images")

	if cfg.MinIO.AccessKey == "" {
		return nil, fmt.Errorf("MINIO_ACCESS_KEY is required")
	}
	if cfg.MinIO.SecretKey == "" {
		return nil, fmt.Errorf("MINIO_SECRET_KEY is required")
	}

	return cfg, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
