package app

import (
	"github.com/gin-gonic/gin"
	authpostgres "github.com/tatKOMre/cyberplatform/backend/internal/auth/outbound/db/postgres"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/config"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
	"github.com/tatKOMre/cyberplatform/backend/internal/sso/domain"
	"github.com/tatKOMre/cyberplatform/backend/internal/sso/inbound/http"
	"github.com/tatKOMre/cyberplatform/backend/internal/sso/outbound/db/postgres"
	"gorm.io/gorm"
)

type App struct {
	Handler *http.Handler
	Router  *gin.Engine
	MW      *middleware.Middleware
	DB      *gorm.DB
}

func New(router *gin.Engine, mw *middleware.Middleware, db *gorm.DB, cfg *config.Config) *App {
	app := &App{
		Router: router,
		MW:     mw,
		DB:     db,
	}
	repository := postgres.New(app.DB)
	authRepo := authpostgres.New(app.DB)
	ssoCfg := domain.Config{
		Issuer:   cfg.SSO.Issuer,
		CodeTTL:  cfg.SSO.CodeTTL,
		TokenTTL: cfg.SSO.TokenTTL,
	}
	signer := domain.NewJWTSigner([]byte(cfg.Auth.JWTSecret), ssoCfg.Issuer, ssoCfg.TokenTTL)
	userReader := domain.NewUserReader(authRepo)
	service := domain.New(repository, *userReader, signer, ssoCfg)
	handler := http.New(service)

	app.Handler = handler
	http.RegisterRoutes(app.Router, app.Handler, app.MW)

	return app
}
