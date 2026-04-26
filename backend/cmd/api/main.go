package main

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"

	"github.com/gin-contrib/cors"
	authapp "github.com/tatKOMre/cyberplatform/backend/internal/auth/app"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
	authpostgres "github.com/tatKOMre/cyberplatform/backend/internal/auth/outbound/db/postgres"
	newsapp "github.com/tatKOMre/cyberplatform/backend/internal/news/app"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/config"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/db"
	dbm "github.com/tatKOMre/cyberplatform/backend/internal/platform/db"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
	platformhttpmw "github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/storage/minio"
	ssoapp "github.com/tatKOMre/cyberplatform/backend/internal/sso/app"
)

func main() {
	cfg := config.MustLoad()

	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()
	router.Use(platformhttpmw.LoggerMW(), gin.Recovery())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.HTTP.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	db, err := db.ConnectToDataBase(cfg.DB.DSN)
	if err != nil {
		log.Fatalf("db init error: %v", err)
	}
	err = dbm.AutoMigrates(db)
	if err != nil {
		log.Fatalf("db migrations error: %v", err)
	}

	storage, err := minio.New(
		cfg.MinIO.InternalEndpoint,
		cfg.MinIO.InternalSecure,
		cfg.MinIO.PublicEndpoint,
		cfg.MinIO.PublicSecure,
		cfg.MinIO.AccessKey,
		cfg.MinIO.SecretKey,
	)
	if err != nil {
		log.Fatalf("minio init error: %v", err)
	}

	ctx := context.Background()

	if err := storage.EnsureBucket(ctx, cfg.MinIO.AvatarsBucket); err != nil {
		log.Fatalf("ensure avatars bucket error: %v", err)
	}
	if err := storage.EnsureBucket(ctx, cfg.MinIO.ImagesBucket); err != nil {
		log.Fatalf("ensure images bucket error: %v", err)
	}
	authCfg := domain.Config{
		SignKey:    []byte(cfg.Auth.JWTSecret),
		AccessTTL:  cfg.Auth.AccessTTL,
		RefreshTTL: cfg.Auth.RefreshTTL,
	}
	authRepo := authpostgres.New(db)
	middleware := middleware.New([]byte(cfg.Auth.JWTSecret), authRepo)
	auth := authapp.New(db, router, middleware, authCfg, cfg, storage, cfg.MinIO.AvatarsBucket)
	_ = newsapp.New(db, router, storage, cfg.MinIO.ImagesBucket, middleware)
	_ = ssoapp.New(router, middleware, db, cfg)
	addr := cfg.HTTP.Addr()
	log.Printf("starting %s in %s mode on %s", cfg.App.Name, cfg.App.Env, addr)

	auth.StartBackgroundJobs(ctx)

	if err := router.Run(addr); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
