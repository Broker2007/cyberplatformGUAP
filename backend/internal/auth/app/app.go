package app

import (
	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/inbound/http"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/outbound/db/postgres"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/config"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
	"gorm.io/gorm"
)

type App struct {
	Handler *http.Handler
	Router  *gin.Engine
	MW      *middleware.Middleware
	DB      *gorm.DB
}

func New(db *gorm.DB,
	router *gin.Engine,
	mw *middleware.Middleware,
	cfgu domain.Config,
	cfg *config.Config,
	storage domain.ObjectStorageInterface,
	AvatarsBucket string,
) *App {
	app := &App{
		DB:     db,
		Router: router,
		MW:     mw,
	}

	repository := postgres.New(app.DB)
	service := domain.New(repository, cfgu, storage, AvatarsBucket)
	cookiecfg := http.CookieConfig{
		Name:          "refresh_token",
		Domain:        cfg.HTTP.CookieDomain,
		Path:          "/",
		Secure:        cfg.HTTP.CookieSecure,
		HttpOnly:      true,
		RefreshMaxAge: int(cfgu.RefreshTTL.Seconds()),
	}
	handler := http.New(service, cookiecfg)

	app.Handler = handler

	http.RegisterRoutes(app.Router, app.Handler, app.MW)

	return app
}
