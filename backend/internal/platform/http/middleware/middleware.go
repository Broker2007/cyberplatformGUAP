package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	authdomain "github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
	"github.com/tatKOMre/cyberplatform/backend/pkg/hash"
	"github.com/tatKOMre/cyberplatform/backend/pkg/token"
)

type Middleware struct {
	SignKey  []byte
	AuthRepo authdomain.RepositoryInterface
}

func New(key []byte, auth authdomain.RepositoryInterface) *Middleware {
	return &Middleware{
		SignKey:  key,
		AuthRepo: auth,
	}
}

func (m *Middleware) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
			c.Abort()
			return
		}
		const prefix = "Bearer "
		if !strings.HasPrefix(authHeader, prefix) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
			c.Abort()
			return
		}
		strToken := strings.TrimPrefix(authHeader, prefix)
		claims, err := token.ParseJWT(strToken, m.SignKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
			c.Abort()
			return
		}
		act := security.NewActorFromClaims(claims)
		c.Set("actor", act)

		c.Next()
	}
}

func (m *Middleware) AuthSSO() gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshtoken, err := c.Cookie("refresh_token")
		if err != nil || refreshtoken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
			c.Abort()
			return
		}
		refreshhash := hash.Hash(refreshtoken)
		session, err := m.AuthRepo.GetSessionByRefreshHash(c.Request.Context(), refreshhash)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
			c.Abort()
			return
		}
		user, err := m.AuthRepo.GetUser(c.Request.Context(), session.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized"})
			c.Abort()
			return
		}
		role := security.RoleUser
		if user.Role {
			role = security.RoleAdmin
		}

		act := &security.Actor{
			UserID: user.ID,
			Role:   role,
		}
		c.Set("actor", act)

		c.Next()
	}
}
