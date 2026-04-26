package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/sso/domain"
	"gorm.io/gorm"
)

type ClientModel struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name        string    `gorm:"not null"`
	ClientID    string    `gorm:"uniqueIndex;not null"`
	RedirectURL string    `gorm:"not null"`
	IsActive    bool      `gorm:"not null"`
	CreatedAt   time.Time `gorm:"not null"`
}

func modelToDomainClient(m ClientModel) domain.SSOClient {
	return domain.SSOClient{
		ID:          m.ID,
		Name:        m.Name,
		ClientID:    m.ClientID,
		RedirectURL: m.RedirectURL,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
	}
}

func (r *Repository) GetByClientID(ctx context.Context, clientID string) (*domain.SSOClient, error) {
	var model ClientModel

	err := r.db.WithContext(ctx).
		Where("client_id = ?", clientID).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	client := modelToDomainClient(model)
	return &client, nil
}
