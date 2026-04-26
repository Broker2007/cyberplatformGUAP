package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/sso/domain"
	"gorm.io/gorm"
)

type CodeModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	CodeHash  string    `gorm:"uniqueIndex;not null"`
	ClientID  string    `gorm:"index;not null"`
	UserID    uuid.UUID `gorm:"type:uuid;index;not null"`
	ExpiresAt time.Time `gorm:"index;not null"`
	UsedAt    *time.Time
	CreatedAt time.Time `gorm:"not null"`
}

func modelToDomainCode(m CodeModel) domain.AuthorizationCode {
	return domain.AuthorizationCode{
		ID:        m.ID,
		CodeHash:  m.CodeHash,
		ClientID:  m.ClientID,
		UserID:    m.UserID,
		ExpiresAt: m.ExpiresAt,
		UsedAt:    m.UsedAt,
		CreatedAt: m.CreatedAt,
	}
}

func domainToModelCode(c domain.AuthorizationCode) CodeModel {
	return CodeModel{
		ID:        c.ID,
		CodeHash:  c.CodeHash,
		ClientID:  c.ClientID,
		UserID:    c.UserID,
		ExpiresAt: c.ExpiresAt,
		UsedAt:    c.UsedAt,
		CreatedAt: c.CreatedAt,
	}
}

func (r *Repository) CreateCode(ctx context.Context, code *domain.AuthorizationCode) error {
	model := domainToModelCode(*code)
	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *Repository) GetByCode(ctx context.Context, codec string) (*domain.AuthorizationCode, error) {
	var model CodeModel
	err := r.db.WithContext(ctx).
		Where("code_hash = ?", codec).
		First(&model).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	code := modelToDomainCode(model)
	return &code, nil
}

func (r *Repository) MarkUsed(ctx context.Context, id uuid.UUID, usedAt time.Time) error {
	return r.db.WithContext(ctx).
		Model(&CodeModel{}).
		Where("id = ?", id).
		Update("used_at", usedAt).Error
}
