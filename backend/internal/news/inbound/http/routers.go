package http

import (
	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/http/middleware"
)

func RegisterRoutes(rg *gin.Engine, handler *Handler, MW *middleware.Middleware) {
	news := rg.Group("/news")
	{
		news.GET("/publications", handler.ShowPublications)
	}

	newsProtected := news.Group("/")
	newsProtected.Use(MW.AuthRequired())

	{
		newsProtected.POST("/publications", handler.CreatePublication)
		newsProtected.POST("/publications/:id/images", handler.AddImages)
		newsProtected.DELETE("/publications/:id/images/:imageID", handler.DeleteImage)
		newsProtected.DELETE("/publications/:id", handler.DeletePublication)
	}
}
