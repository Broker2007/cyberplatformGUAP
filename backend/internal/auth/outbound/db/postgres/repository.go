package postgres

import (
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

func New(db *gorm.DB) domain.RepositoryInterface {
	return &Repository{
		DB: db,
	}
}
