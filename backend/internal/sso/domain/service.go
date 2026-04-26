package domain

import (
	"context"
	"net/url"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
	"github.com/tatKOMre/cyberplatform/backend/pkg/hash"
)

type Config struct {
	Issuer   string
	CodeTTL  time.Duration
	TokenTTL time.Duration
}

type Service struct {
	Repository RepositoryInterface
	userReader UserReader
	signer     Signer
	cfg        Config
}

type ExchangeResponse struct {
	Token string `json:"token"`
}

func New(
	repository RepositoryInterface,
	userReader UserReader,
	signer Signer,
	cfg Config,
) *Service {
	return &Service{
		Repository: repository,
		userReader: userReader,
		signer:     signer,
		cfg:        cfg,
	}
}

func (s *Service) Authorize(ctx context.Context, clientID string, act *security.Actor) (string, error) {
	client, err := s.Repository.GetByClientID(ctx, clientID)
	if err != nil {
		return "", err
	}
	if client == nil {
		return "", ErrClientNotFound
	}
	if !client.IsActive {
		return "", ErrClientInactive
	}
	if act == nil {
		return "", ErrUnauthorized
	}
	rawCode := uuid.New().String()
	now := time.Now().UTC()
	codeHash := hash.Hash(rawCode)
	code := AuthorizationCode{
		ID:        uuid.New(),
		CodeHash:  codeHash,
		ClientID:  client.ClientID,
		UserID:    act.UserID,
		ExpiresAt: now.Add(s.cfg.CodeTTL),
		CreatedAt: now,
	}

	if err := s.Repository.CreateCode(ctx, &code); err != nil {
		return "", err
	}

	redirectURL, err := url.Parse(client.RedirectURL)
	if err != nil {
		return "", err
	}

	q := redirectURL.Query()
	q.Set("code", rawCode)
	redirectURL.RawQuery = q.Encode()

	return redirectURL.String(), nil
}

func (s *Service) Exchange(ctx context.Context, clientID, rawCode string) (*ExchangeResponse, error) {
	client, err := s.Repository.GetByClientID(ctx, clientID)
	if err != nil {
		return nil, err
	}
	if client == nil {
		return nil, ErrClientNotFound
	}
	if !client.IsActive {
		return nil, ErrClientInactive
	}
	codeHash := hash.Hash(rawCode)
	code, err := s.Repository.GetByCode(ctx, codeHash)
	if err != nil {
		return nil, err
	}
	if code == nil {
		return nil, ErrInvalidCode
	}
	if code.ClientID != clientID {
		return nil, ErrInvalidCode
	}
	if code.UsedAt != nil {
		return nil, ErrCodeUsed
	}
	if time.Now().UTC().After(code.ExpiresAt) {
		return nil, ErrCodeExpired
	}

	if err := s.Repository.MarkUsed(ctx, code.ID, time.Now().UTC()); err != nil {
		return nil, err
	}

	user, err := s.userReader.GetByID(ctx, code.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCode
	}

	claims := SSOClaims{
		Sub:      user.ID.String(),
		Email:    user.Email,
		Name:     user.FullName,
		Username: user.FullName,
	}

	token, err := s.signer.Sign(claims)
	if err != nil {
		return nil, err
	}

	return &ExchangeResponse{
		Token: token,
	}, nil
}
