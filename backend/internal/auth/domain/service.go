package domain

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
	"github.com/tatKOMre/cyberplatform/backend/pkg/hash"
	"github.com/tatKOMre/cyberplatform/backend/pkg/token"
)

type Service struct {
	Repository   RepositoryInterface
	Cfg          Config
	Storage      ObjectStorageInterface
	AvatarBucket string
	// audit		audit.Writer
}

func New(repo RepositoryInterface, cfg Config, storage ObjectStorageInterface, avatarBucket string) *Service {
	return &Service{
		Repository:   repo,
		Cfg:          cfg,
		Storage:      storage,
		AvatarBucket: avatarBucket,
	}
}

type RequestMeta struct {
	UserAgent string
	IP        string
}

func avatarExtension(contentType string) (string, error) {
	switch contentType {
	case "image/jpeg":
		return ".jpg", nil
	case "image/png":
		return ".png", nil
	case "image/webp":
		return ".webp", nil
	default:
		return "", ErrInvalidRequest
	}
}

func (s *Service) UpdateAvatar(
	ctx context.Context,
	userID uuid.UUID,
	body io.Reader,
	size int64,
	contentType string,
	act *security.Actor,
) error {
	if !act.IsSystem() && !act.IsAdmin() && act.UserID != userID {
		return ErrPermissionDenied
	}

	user, err := s.Repository.GetUser(ctx, userID)
	if err != nil {
		return err
	}
	if size <= 0 || size > 5*1024*1024 {
		return ErrInvalidRequest
	}
	ext, err := avatarExtension(contentType)
	if err != nil {
		return err
	}
	key := fmt.Sprintf("users/%s/avatars/%s%s", userID.String(), uuid.NewString(), ext)

	err = s.Storage.PutObject(ctx, s.AvatarBucket, key, body, size, contentType)
	if err != nil {
		return err
	}

	oldAvatar := user.Avatar
	user.Avatar = &key

	if err := s.Repository.UpdateUser(ctx, user); err != nil {
		s.Storage.DeleteObject(ctx, s.AvatarBucket, key)
		return err
	}

	if oldAvatar != nil && *oldAvatar != "" {
		_ = s.Storage.DeleteObject(ctx, s.AvatarBucket, *oldAvatar)
	}
	return nil
}

func (s *Service) GetAvatarURL(ctx context.Context, userID uuid.UUID, act *security.Actor) (string, error) {
	if !act.IsSystem() && !act.IsAdmin() && act.UserID != userID {
		return "", ErrPermissionDenied
	}

	user, err := s.Repository.GetUser(ctx, userID)
	if err != nil {
		return "", err
	}

	if user.Avatar == nil || *user.Avatar == "" {
		return "", nil
	}
	url, err := s.Storage.GetPresignedURL(ctx, s.AvatarBucket, *user.Avatar, 15*time.Minute)
	if err != nil {
		log.Printf("get avatar presigned url failed: bucket=%s key=%s err=%v", s.AvatarBucket, *user.Avatar, err)
		return "", nil
	}
	return url, nil
}

func (s *Service) CreateUser(ctx context.Context, email, password, fullName string, act *security.Actor) error {
	if !act.IsSystem() && !act.IsAdmin() {
		return ErrPermissionDenied // not errNotPermission
	}
	_, err := s.Repository.GetUserByEmail(ctx, email)
	if err == nil {
		return ErrEmailAlreadyUsed
	}
	hashpass, err := hash.HashPassword(password)
	if err != nil {
		return err
	}
	user := &User{
		ID:       uuid.New(),
		FullName: fullName,
		Email:    email,
		Hashpass: hashpass,
		Role:     false,
		Avatar:   nil,
	}
	err = s.Repository.CreateUser(ctx, user)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) GetUser(ctx context.Context, id uuid.UUID, act *security.Actor) (*User, error) {
	if !act.IsSystem() && !act.IsAdmin() && act.UserID != id {
		return nil, ErrPermissionDenied
	}
	user, err := s.Repository.GetUser(ctx, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Переписать нахуй на разные методы в будущем снизу
func (s *Service) UpdateUser(ctx context.Context, user *User, act *security.Actor) error {
	if !act.IsSystem() && !act.IsAdmin() && act.UserID != user.ID {
		return ErrPermissionDenied
	}
	err := s.Repository.UpdateUser(ctx, user)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) DeleteUser(ctx context.Context, id uuid.UUID, act *security.Actor) error {
	if !act.IsSystem() && !act.IsAdmin() && act.UserID != id {
		return ErrPermissionDenied
	}
	err := s.Repository.DeleteUser(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) GetUserByEmail(ctx context.Context, email string, act *security.Actor) (*User, error) {
	if !act.IsSystem() && !act.IsAdmin() {
		return nil, ErrPermissionDenied
	}
	user, err := s.Repository.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return user, err
}

func (s *Service) CreateSession(ctx context.Context, session *Session) error {
	err := s.Repository.CreateSession(ctx, session)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) GetSession(ctx context.Context, id uuid.UUID) (*Session, error) {
	session, err := s.Repository.GetSession(ctx, id)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *Service) GetByRefreshHash(ctx context.Context, hash string) (*Session, error) {
	session, err := s.Repository.GetSessionByRefreshHash(ctx, hash)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *Service) RotateToken(ctx context.Context, refreshtoken string) (Tokens, error) {
	refreshTokenHash := hash.Hash(refreshtoken)

	session, err := s.Repository.GetSessionByRefreshHash(ctx, refreshTokenHash)
	if err != nil {
		return Tokens{}, err
	}
	user, err := s.Repository.GetUser(ctx, session.UserID)
	if err != nil {
		return Tokens{}, err // 404 not found
	}
	claims := token.Claims{
		ID:   session.UserID,
		Role: user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.Cfg.AccessTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	accessToken, err := token.GenerateJWT(&claims, s.Cfg.SignKey)
	if err != nil {
		return Tokens{}, err // 500
	}

	newRefresh := uuid.New().String()
	newRefreshHash := hash.Hash(newRefresh)
	rotatedAt := time.Now().UTC()

	err = s.Repository.RotateToken(ctx, session.ID, refreshTokenHash, newRefreshHash, rotatedAt)
	if err != nil {
		return Tokens{}, err
	}
	tokens := Tokens{
		AccessToken:  accessToken,
		RefreshToken: newRefresh,
	}
	return tokens, nil
}

func (s *Service) RevokeSession(ctx context.Context, refreshtoken string, act *security.Actor) error {
	hash := hash.Hash(refreshtoken)
	session, err := s.Repository.GetSessionByRefreshHash(ctx, hash)
	if err != nil {
		return err
	}
	if !act.IsSystem() && !act.IsAdmin() && act.UserID != session.UserID {
		return ErrPermissionDenied // errNotPermission
		// audit.Write(temple)
	}
	err = s.Repository.RevokeSession(ctx, session.ID)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) RevokeAllByUser(ctx context.Context, id uuid.UUID, act *security.Actor) (int64, error) {
	if !act.IsSystem() && !act.IsAdmin() && act.UserID != id {
		return 0, ErrPermissionDenied // errNotPermission
		// audit.Write(temple)
	}
	result, err := s.Repository.RevokeAllByUser(ctx, id)
	if err != nil {
		return 0, err
	}
	return result, nil
}

func (s *Service) CleanupExpiredSessions(ctx context.Context) error {
	_, err := s.Repository.DeleteExpired(ctx) // В аудит выводить
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) SignUp(ctx context.Context, email, password, fullName string) error {
	actor := security.SystemActor()
	_, err := s.GetUserByEmail(ctx, email, actor)
	if err == nil {
		return ErrEmailAlreadyUsed
	}

	hashpass, err := hash.HashPassword(password)
	if err != nil {
		return err
	}
	user := &User{
		ID:       uuid.New(),
		FullName: fullName,
		Email:    email,
		Hashpass: hashpass,
		Role:     false,
		Avatar:   nil,
	}
	err = s.Repository.CreateUser(ctx, user)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) SignIn(ctx context.Context, email, password string, meta RequestMeta) (Tokens, error) {
	user, err := s.Repository.GetUserByEmail(ctx, email)
	if err != nil {
		return Tokens{}, err
	}
	if err := hash.CheckPassword(password, user.Hashpass); err != nil {
		return Tokens{}, ErrInvalidPassword // прописать тип ошибки
	}
	claims := &token.Claims{
		ID:   user.ID,
		Role: user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.Cfg.AccessTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	accestoken, err := token.GenerateJWT(claims, s.Cfg.SignKey)
	if err != nil {
		return Tokens{}, err
	}
	refreshtoken := uuid.NewString()
	refreshtokenhash := hash.Hash(refreshtoken)
	expires := time.Now().UTC().Add(s.Cfg.RefreshTTL)
	session := &Session{
		ID:               uuid.New(),
		UserID:           user.ID,
		RefreshTokenHash: refreshtokenhash,
		UserAgent:        meta.UserAgent,
		IP:               meta.IP,
		ExpiresAt:        expires,
	}
	err = s.Repository.CreateSession(ctx, session)
	if err != nil {
		return Tokens{}, err
	}
	tokens := Tokens{
		AccessToken:  accestoken,
		RefreshToken: refreshtoken,
	}
	return tokens, nil
}
