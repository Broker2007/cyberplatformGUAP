package http

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
)

func HandleError(c *gin.Context, err error) {
	log.Println(err)
	switch {
	case err == nil:
		return

	case errors.Is(err, domain.ErrInvalidRequest):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return

	case errors.Is(err, domain.ErrEmailAlreadyUsed):
		c.JSON(http.StatusConflict, gin.H{"error": "email already used"})
		return

	case errors.Is(err, domain.ErrInvalidPassword):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return

	case errors.Is(err, domain.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return

	case errors.Is(err, domain.ErrPermissionDenied):
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	case errors.Is(err, domain.ErrUnauthorized):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
		return
	default:
		// ВАЖНО: клиенту — ничего лишнего
		log.Printf("internal error: %T: %v", err, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
}
