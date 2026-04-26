package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
	"gorm.io/gorm"
)

type SessionModel struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID           uuid.UUID `gorm:"not null" json:"userId"`
	RefreshTokenHash string    `gorm:"not null";index`
	UserAgent        string    `gorm:"not null"`
	IP               string    `gorm:"not null"`
	ExpiresAt        time.Time `gorm:"not null"`
	RevokedAt        *time.Time
	RotatedAt        *time.Time
	CreatedAt        time.Time
	UpdatedAt        *time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

func toModelSession(s *domain.Session) *SessionModel {
	return &SessionModel{
		ID:               s.ID,
		UserID:           s.UserID,
		RefreshTokenHash: s.RefreshTokenHash,
		UserAgent:        s.UserAgent,
		IP:               s.IP,
		ExpiresAt:        s.ExpiresAt,
		RevokedAt:        s.RevokedAt,
		RotatedAt:        s.RotatedAt,
		CreatedAt:        s.CreatedAt,
		UpdatedAt:        s.UpdatedAt,
	}
}

func toDomainSession(s *SessionModel) *domain.Session {
	return &domain.Session{
		ID:               s.ID,
		UserID:           s.UserID,
		RefreshTokenHash: s.RefreshTokenHash,
		UserAgent:        s.UserAgent,
		IP:               s.IP,
		ExpiresAt:        s.ExpiresAt,
		RevokedAt:        s.RevokedAt,
		RotatedAt:        s.RotatedAt,
		CreatedAt:        s.CreatedAt,
		UpdatedAt:        s.UpdatedAt,
	}
}

func (r *Repository) CreateSession(ctx context.Context, session *domain.Session) error {
	sessionm := toModelSession(session)
	err := r.DB.WithContext(ctx).Create(sessionm).Error
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetSession(ctx context.Context, id uuid.UUID) (*domain.Session, error) {
	sessionm := &SessionModel{}
	now := time.Now().UTC()

	err := r.DB.WithContext(ctx).
		Where("id = ?", id).
		Where("revoked_at IS NULL").
		Where("expires_at > ?", now).
		First(sessionm).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Мы НЕ принимаем решение
		return nil, domain.ErrNotFound
	}

	if err != nil {
		return nil, err
	}
	session := toDomainSession(sessionm)
	return session, nil
}

func (r *Repository) GetSessionByRefreshHash(ctx context.Context, hash string) (*domain.Session, error) {
	sessionm := &SessionModel{}
	now := time.Now().UTC()

	err := r.DB.WithContext(ctx).
		Where("refresh_token_hash = ?", hash).
		Where("revoked_at IS NULL").
		Where("expires_at > ?", now).
		First(sessionm).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Мы НЕ принимаем решение
		// Мы просто говорим домену: "пользователь отсутствует"
		return nil, domain.ErrNotFound
	}

	if err != nil {
		return nil, err
	}
	session := toDomainSession(sessionm)
	return session, nil
}

func (r *Repository) RotateToken(ctx context.Context, sessionID uuid.UUID, oldhash, newHash string, rotatedAt time.Time) error {
	result := r.DB.WithContext(ctx).
		Model(&SessionModel{}).
		Where("id = ? AND revoked_at IS NULL AND refresh_token_hash = ?", sessionID, oldhash).
		Updates(map[string]any{
			"refresh_token_hash": newHash,
			"rotated_at":         rotatedAt,
			"updated_at":         time.Now().UTC(),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repository) RevokeSession(ctx context.Context, id uuid.UUID) error {
	now := time.Now().UTC()

	result := r.DB.WithContext(ctx).
		Model(&SessionModel{}).
		Where("id = ? AND revoked_at IS NULL", id).
		Update("revoked_at", now)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repository) RevokeAllByUser(ctx context.Context, id uuid.UUID) (int64, error) {
	now := time.Now().UTC()

	result := r.DB.WithContext(ctx).
		Model(&SessionModel{}).
		Where("user_id = ? AND revoked_at IS NULL", id).
		Update("revoked_at", now)

	if result.Error != nil {
		return 0, result.Error
	}

	return result.RowsAffected, nil
}

func (r *Repository) DeleteExpired(ctx context.Context) (int64, error) {
	now := time.Now().UTC()
	result := r.DB.WithContext(ctx).Where("expires_at < ? OR revoked_at IS NOT NULL", now).Delete(&SessionModel{})
	if result.Error != nil {
		return 0, result.Error
	}
	return result.RowsAffected, nil
}
