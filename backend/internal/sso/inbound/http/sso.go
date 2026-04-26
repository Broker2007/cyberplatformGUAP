package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
)

func (h *Handler) Authorize(c *gin.Context) {
	clientID := c.Query("client_id")
	if clientID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "client_id is required"})
		return
	}

	act, ok := security.ActorFromGinContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
		return
	}

	redirectURL, err := h.Service.Authorize(c.Request.Context(), clientID, act)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.Redirect(http.StatusFound, redirectURL)
}

func (h *Handler) Exchange(c *gin.Context) {
	var req ExchangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	resp, err := h.Service.Exchange(c.Request.Context(), req.ClientID, req.Code)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}
