package domain

import (
	"time"

	"github.com/google/uuid"
)

type AuthorizationCode struct {
	ID        uuid.UUID
	CodeHash  string
	ClientID  string
	UserID    uuid.UUID
	ExpiresAt time.Time
	UsedAt    *time.Time
	CreatedAt time.Time
}
