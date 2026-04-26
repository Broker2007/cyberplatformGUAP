package token

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	ID   uuid.UUID
	Role bool
	jwt.RegisteredClaims
}
