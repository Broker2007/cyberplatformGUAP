package domain

import (
	"time"

	"github.com/google/uuid"
)

type SSOClient struct {
	ID          uuid.UUID
	Name        string
	ClientID    string
	RedirectURL string
	IsActive    bool
	CreatedAt   time.Time
}
