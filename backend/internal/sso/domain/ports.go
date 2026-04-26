package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
)

type RepositoryInterface interface {
	CreateCode(ctx context.Context, code *AuthorizationCode) error
	GetByCode(ctx context.Context, codec string) (*AuthorizationCode, error)
	MarkUsed(ctx context.Context, id uuid.UUID, usedAt time.Time) error

	GetByClientID(ctx context.Context, clientID string) (*SSOClient, error)
}

type Signer interface {
	Sign(claims SSOClaims) (string, error)
}

type ServiceInterface interface {
	Authorize(ctx context.Context, clientID string, act *security.Actor) (string, error)
	Exchange(ctx context.Context, clientID, rawcode string) (*ExchangeResponse, error)
}
