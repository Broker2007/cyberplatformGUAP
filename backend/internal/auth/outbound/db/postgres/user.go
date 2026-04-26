package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
	"gorm.io/gorm"
)

type UserModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	FullName  string    `gorm:"not null" json:"fullName"`
	Email     string    `gorm:"not null;uniqueIndex" json:"email"`
	Hashpass  string    `gorm:"not null"`
	Role      bool      `gorm:"not null;default:false" json:"role"`
	Avatar    *string   `json:"avatar"`
	CreatedAt time.Time
	UpdatedAt *time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func toModelUser(u *domain.User) *UserModel {
	return &UserModel{
		ID:        u.ID,
		FullName:  u.FullName,
		Email:     u.Email,
		Hashpass:  u.Hashpass,
		Role:      u.Role,
		Avatar:    u.Avatar,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func toDomainUser(u *UserModel) *domain.User {
	return &domain.User{
		ID:        u.ID,
		FullName:  u.FullName,
		Email:     u.Email,
		Hashpass:  u.Hashpass,
		Role:      u.Role,
		Avatar:    u.Avatar,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func (r *Repository) GetUser(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	userm := &UserModel{}

	err := r.DB.WithContext(ctx).First(userm, id).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Мы НЕ принимаем решение
		// Мы просто говорим домену: "пользователь отсутствует"
		return nil, domain.ErrNotFound
	}

	if err != nil {
		return nil, err
	}
	user := toDomainUser(userm)
	return user, nil
}

func (r *Repository) CreateUser(ctx context.Context, user *domain.User) error {
	userm := toModelUser(user)
	err := r.DB.WithContext(ctx).Create(userm).Error
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) UpdateUser(ctx context.Context, user *domain.User) error {
	userm := toModelUser(user)
	err := r.DB.WithContext(ctx).Save(userm).Error
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) DeleteUser(ctx context.Context, id uuid.UUID) error {
	userm := &UserModel{}
	err := r.DB.WithContext(ctx).Delete(userm, id).Error
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	userm := &UserModel{}
	err := r.DB.WithContext(ctx).Where("email = ?", email).First(userm).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Мы НЕ принимаем решение
		// Мы просто говорим домену: "пользователь отсутствует"
		return nil, domain.ErrNotFound
	}

	if err != nil {
		return nil, err
	}
	user := toDomainUser(userm)
	return user, nil
}
