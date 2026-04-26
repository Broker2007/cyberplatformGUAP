package domain

import (
	"time"

	"github.com/google/uuid"
)

type NewsImage struct {
	ID            uuid.UUID
	PublicationID uuid.UUID
	Key           string
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}
