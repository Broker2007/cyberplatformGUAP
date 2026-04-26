package domain

import (
	"bytes"
	"context"
	"errors"
	"io"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
	hashpkg "github.com/tatKOMre/cyberplatform/backend/pkg/hash"
	tokenpkg "github.com/tatKOMre/cyberplatform/backend/pkg/token"
)

type authRepoFake struct {
	getUserFn                 func(ctx context.Context, id uuid.UUID) (*User, error)
	createUserFn              func(ctx context.Context, user *User) error
	updateUserFn              func(ctx context.Context, user *User) error
	deleteUserFn              func(ctx context.Context, id uuid.UUID) error
	getUserByEmailFn          func(ctx context.Context, email string) (*User, error)
	createSessionFn           func(ctx context.Context, session *Session) error
	getSessionFn              func(ctx context.Context, id uuid.UUID) (*Session, error)
	getSessionByRefreshHashFn func(ctx context.Context, hash string) (*Session, error)
	rotateTokenFn             func(ctx context.Context, sessionid uuid.UUID, oldhash, newHash string, rotatedAt time.Time) error
	revokeSessionFn           func(ctx context.Context, id uuid.UUID) error
	revokeAllByUserFn         func(ctx context.Context, id uuid.UUID) (int64, error)
	deleteExpiredFn           func(ctx context.Context) (int64, error)
}

func (f *authRepoFake) GetUser(ctx context.Context, id uuid.UUID) (*User, error) {
	if f.getUserFn != nil {
		return f.getUserFn(ctx, id)
	}
	return nil, ErrNotFound
}

func (f *authRepoFake) CreateUser(ctx context.Context, user *User) error {
	if f.createUserFn != nil {
		return f.createUserFn(ctx, user)
	}
	return nil
}

func (f *authRepoFake) UpdateUser(ctx context.Context, user *User) error {
	if f.updateUserFn != nil {
		return f.updateUserFn(ctx, user)
	}
	return nil
}

func (f *authRepoFake) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if f.deleteUserFn != nil {
		return f.deleteUserFn(ctx, id)
	}
	return nil
}

func (f *authRepoFake) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	if f.getUserByEmailFn != nil {
		return f.getUserByEmailFn(ctx, email)
	}
	return nil, ErrNotFound
}

func (f *authRepoFake) CreateSession(ctx context.Context, session *Session) error {
	if f.createSessionFn != nil {
		return f.createSessionFn(ctx, session)
	}
	return nil
}

func (f *authRepoFake) GetSession(ctx context.Context, id uuid.UUID) (*Session, error) {
	if f.getSessionFn != nil {
		return f.getSessionFn(ctx, id)
	}
	return nil, ErrNotFound
}

func (f *authRepoFake) GetSessionByRefreshHash(ctx context.Context, hash string) (*Session, error) {
	if f.getSessionByRefreshHashFn != nil {
		return f.getSessionByRefreshHashFn(ctx, hash)
	}
	return nil, ErrNotFound
}

func (f *authRepoFake) RotateToken(ctx context.Context, sessionid uuid.UUID, oldhash, newHash string, rotatedAt time.Time) error {
	if f.rotateTokenFn != nil {
		return f.rotateTokenFn(ctx, sessionid, oldhash, newHash, rotatedAt)
	}
	return nil
}

func (f *authRepoFake) RevokeSession(ctx context.Context, id uuid.UUID) error {
	if f.revokeSessionFn != nil {
		return f.revokeSessionFn(ctx, id)
	}
	return nil
}

func (f *authRepoFake) RevokeAllByUser(ctx context.Context, id uuid.UUID) (int64, error) {
	if f.revokeAllByUserFn != nil {
		return f.revokeAllByUserFn(ctx, id)
	}
	return 0, nil
}

func (f *authRepoFake) DeleteExpired(ctx context.Context) (int64, error) {
	if f.deleteExpiredFn != nil {
		return f.deleteExpiredFn(ctx)
	}
	return 0, nil
}

type authStorageFake struct {
	putObjectFn       func(ctx context.Context, bucket, key string, body io.Reader, size int64, contentType string) error
	deleteObjectFn    func(ctx context.Context, bucket, key string) error
	getPresignedURLFn func(ctx context.Context, bucket, key string, expires time.Duration) (string, error)

	deletedKeys []string
}

func (f *authStorageFake) PutObject(ctx context.Context, bucket, key string, body io.Reader, size int64, contentType string) error {
	if f.putObjectFn != nil {
		return f.putObjectFn(ctx, bucket, key, body, size, contentType)
	}
	return nil
}

func (f *authStorageFake) DeleteObject(ctx context.Context, bucket, key string) error {
	if f.deleteObjectFn != nil {
		return f.deleteObjectFn(ctx, bucket, key)
	}
	f.deletedKeys = append(f.deletedKeys, bucket+"/"+key)
	return nil
}

func (f *authStorageFake) GetPresignedURL(ctx context.Context, bucket, key string, expires time.Duration) (string, error) {
	if f.getPresignedURLFn != nil {
		return f.getPresignedURLFn(ctx, bucket, key, expires)
	}
	return "https://example.com/" + key, nil
}

func newAuthService(repo RepositoryInterface, storage ObjectStorageInterface) *Service {
	return New(repo, Config{
		SignKey:    []byte("test-sign-key"),
		AccessTTL:  time.Hour,
		RefreshTTL: 24 * time.Hour,
	}, storage, "avatars")
}

func TestSignUpReturnsEmailAlreadyUsedWhenUserExists(t *testing.T) {
	repo := &authRepoFake{
		getUserByEmailFn: func(ctx context.Context, email string) (*User, error) {
			return &User{ID: uuid.New(), Email: email}, nil
		},
	}
	svc := newAuthService(repo, &authStorageFake{})

	err := svc.SignUp(context.Background(), "user@example.com", "password123", "Test User")
	if !errors.Is(err, ErrEmailAlreadyUsed) {
		t.Fatalf("expected ErrEmailAlreadyUsed, got %v", err)
	}
}

func TestSignInCreatesSessionAndReturnsTokens(t *testing.T) {
	passwordHash, err := hashpkg.HashPassword("password123")
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	userID := uuid.New()
	var createdSession *Session

	repo := &authRepoFake{
		getUserByEmailFn: func(ctx context.Context, email string) (*User, error) {
			return &User{ID: userID, Email: email, Hashpass: passwordHash, Role: true}, nil
		},
		createSessionFn: func(ctx context.Context, session *Session) error {
			createdSession = session
			return nil
		},
	}
	svc := newAuthService(repo, &authStorageFake{})

	tokens, err := svc.SignIn(context.Background(), "admin@example.com", "password123", RequestMeta{UserAgent: "ua", IP: "127.0.0.1"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if tokens.AccessToken == "" || tokens.RefreshToken == "" {
		t.Fatalf("expected both tokens to be set")
	}
	if createdSession == nil {
		t.Fatalf("expected session to be created")
	}
	if createdSession.UserID != userID {
		t.Fatalf("unexpected session user id: %s", createdSession.UserID)
	}
	if createdSession.UserAgent != "ua" || createdSession.IP != "127.0.0.1" {
		t.Fatalf("unexpected request metadata in session: %+v", createdSession)
	}
	if createdSession.RefreshTokenHash == tokens.RefreshToken {
		t.Fatalf("refresh token must not be stored in plain text")
	}

	claims, err := tokenpkg.ParseJWT(tokens.AccessToken, []byte("test-sign-key"))
	if err != nil {
		t.Fatalf("failed to parse generated access token: %v", err)
	}
	if claims.ID != userID || !claims.Role {
		t.Fatalf("unexpected claims: %+v", claims)
	}
}

func TestSignInReturnsInvalidPasswordForWrongPassword(t *testing.T) {
	passwordHash, err := hashpkg.HashPassword("password123")
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	repo := &authRepoFake{
		getUserByEmailFn: func(ctx context.Context, email string) (*User, error) {
			return &User{ID: uuid.New(), Email: email, Hashpass: passwordHash}, nil
		},
	}
	svc := newAuthService(repo, &authStorageFake{})

	_, err = svc.SignIn(context.Background(), "user@example.com", "wrong-password", RequestMeta{})
	if !errors.Is(err, ErrInvalidPassword) {
		t.Fatalf("expected ErrInvalidPassword, got %v", err)
	}
}

func TestRotateTokenUpdatesSessionAndReturnsNewRefreshToken(t *testing.T) {
	userID := uuid.New()
	oldRefresh := "old-refresh-token"
	oldRefreshHash := hashpkg.Hash(oldRefresh)
	sessionID := uuid.New()

	passwordHash, err := hashpkg.HashPassword("password123")
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	var rotateCalled bool
	repo := &authRepoFake{
		getSessionByRefreshHashFn: func(ctx context.Context, hash string) (*Session, error) {
			if hash != oldRefreshHash {
				t.Fatalf("unexpected refresh hash lookup: %s", hash)
			}
			return &Session{ID: sessionID, UserID: userID, RefreshTokenHash: hash}, nil
		},
		getUserFn: func(ctx context.Context, id uuid.UUID) (*User, error) {
			return &User{ID: id, Email: "user@example.com", Hashpass: passwordHash, Role: false}, nil
		},
		rotateTokenFn: func(ctx context.Context, sessionid uuid.UUID, oldhash, newHash string, rotatedAt time.Time) error {
			rotateCalled = true
			if sessionid != sessionID {
				t.Fatalf("unexpected session id: %s", sessionid)
			}
			if oldhash != oldRefreshHash {
				t.Fatalf("unexpected old hash: %s", oldhash)
			}
			if newHash == "" || newHash == oldhash {
				t.Fatalf("unexpected new hash: %s", newHash)
			}
			if rotatedAt.IsZero() {
				t.Fatalf("expected rotatedAt to be set")
			}
			return nil
		},
	}
	svc := newAuthService(repo, &authStorageFake{})

	tokens, err := svc.RotateToken(context.Background(), oldRefresh)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !rotateCalled {
		t.Fatalf("expected repository.RotateToken to be called")
	}
	if tokens.RefreshToken == "" || tokens.RefreshToken == oldRefresh {
		t.Fatalf("expected a new refresh token")
	}
	if tokens.AccessToken == "" {
		t.Fatalf("expected access token")
	}
}

func TestUpdateAvatarDeletesNewObjectWhenUserUpdateFails(t *testing.T) {
	userID := uuid.New()
	oldAvatar := "users/old/avatar.png"

	repo := &authRepoFake{
		getUserFn: func(ctx context.Context, id uuid.UUID) (*User, error) {
			return &User{ID: userID, Avatar: &oldAvatar}, nil
		},
		updateUserFn: func(ctx context.Context, user *User) error {
			return errors.New("db update failed")
		},
	}
	storage := &authStorageFake{}
	svc := newAuthService(repo, storage)

	err := svc.UpdateAvatar(
		context.Background(),
		userID,
		bytes.NewReader([]byte("avatar-bytes")),
		int64(len("avatar-bytes")),
		"image/png",
		&security.Actor{UserID: userID, Role: security.RoleUser},
	)
	if err == nil || err.Error() != "db update failed" {
		t.Fatalf("expected repository error, got %v", err)
	}
	if len(storage.deletedKeys) != 1 {
		t.Fatalf("expected exactly one storage cleanup, got %d", len(storage.deletedKeys))
	}
	if storage.deletedKeys[0] == "avatars/"+oldAvatar {
		t.Fatalf("old avatar must not be deleted on failed update")
	}
}
