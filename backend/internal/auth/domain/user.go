package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID
	FullName  string
	Email     string
	Hashpass  string
	Role      bool
	Avatar    *string
	CreatedAt time.Time
	UpdatedAt *time.Time
}
