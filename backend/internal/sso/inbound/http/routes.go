package http

import (
	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
)

func RegisterRoutes(rg *gin.Engine, handler *Handler, mw *middleware.Middleware) {
	sso := rg.Group("/sso")
	{
		sso.POST("/exchange", handler.Exchange)
	}

	ssoProtected := sso.Group("/")
	ssoProtected.Use(mw.AuthSSO())
	{
		ssoProtected.GET("/authorize", handler.Authorize)
	}
}
