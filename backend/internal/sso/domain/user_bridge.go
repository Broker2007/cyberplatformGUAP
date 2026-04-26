package domain

import (
	"context"

	"github.com/google/uuid"
	authdomain "github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
)

type User struct {
	ID       uuid.UUID
	Email    string
	FullName string
}

type UserReader struct {
	authRepo authdomain.RepositoryInterface
}

func NewUserReader(authRepo authdomain.RepositoryInterface) *UserReader {
	return &UserReader{
		authRepo: authRepo,
	}
}

func (r *UserReader) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	user, err := r.authRepo.GetUser(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, nil
	}

	return &User{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
	}, nil
}
