package domain

import (
	"time"

	"github.com/google/uuid"
)

type Publication struct {
	ID        uuid.UUID
	Title     string
	Content   string
	CreatedAt time.Time
	UpdatedAt *time.Time
}
