package http

import (
	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
)

func RegisterRoutes(rg *gin.Engine, handler *Handler, mw *middleware.Middleware) {
	auth := rg.Group("/auth")
	{
		// открытые группы
		auth.POST("/signup", handler.SignUp)
		auth.POST("/signin", handler.SignIn)
		auth.POST("/refresh", handler.RotateToken)
	}

	authProtected := auth.Group("/")
	authProtected.Use(mw.AuthRequired())

	{
		authProtected.GET("/me", handler.Profile)
		authProtected.POST("/logout", handler.Logout)
		authProtected.POST("/logoutall", handler.LogoutAllSessions)
		authProtected.POST("/updateavatar", handler.UpdateAvatar)
	}
}
