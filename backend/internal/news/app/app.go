package app

import (
	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/news/domain"
	"github.com/tatKOMre/cyberplatform/backend/internal/news/inbound/http"
	"github.com/tatKOMre/cyberplatform/backend/internal/news/outbound/db/postgres"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
	"gorm.io/gorm"
)

type App struct {
	Handler *http.Handler
	Router  *gin.Engine
	MW      *middleware.Middleware
	DB      *gorm.DB
}

func New(db *gorm.DB, router *gin.Engine, storage domain.ObjectStorageInterface, imagesBucket string, mw *middleware.Middleware) *App {
	app := &App{
		DB:     db,
		Router: router,
		MW:     mw,
	}

	repository := postgres.New(app.DB)
	service := domain.New(repository, storage, imagesBucket)
	handler := http.New(service)

	app.Handler = handler

	http.RegisterRoutes(app.Router, app.Handler, mw)

	return app
}
