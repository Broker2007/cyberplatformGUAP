package domain

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID               uuid.UUID
	UserID           uuid.UUID
	RefreshTokenHash string
	UserAgent        string
	IP               string
	ExpiresAt        time.Time
	RevokedAt        *time.Time
	RotatedAt        *time.Time
	CreatedAt        time.Time
	UpdatedAt        *time.Time
}

type Tokens struct {
	AccessToken  string `json:"token"`
	RefreshToken string
}
