package domain

import (
	"context"
	"io"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
)

type RepositoryInterface interface {
	// Взаимодействие с user

	// Получаем пользователь по id
	GetUser(ctx context.Context, id uuid.UUID) (*User, error)
	// Создаём пользователя
	CreateUser(ctx context.Context, user *User) error
	// Обновляем пользователя
	UpdateUser(ctx context.Context, user *User) error
	// Удаляем пользователя
	DeleteUser(ctx context.Context, id uuid.UUID) error
	// Получаем пользователя по e-mail
	GetUserByEmail(ctx context.Context, email string) (*User, error)

	// Взаимодействие с session

	// Создаёт новую сессию
	CreateSession(ctx context.Context, session *Session) error
	// Получает сессию по ID (обычно UUID записи)
	GetSession(ctx context.Context, id uuid.UUID) (*Session, error)
	// Получает по хешу refresh токена (HMAC от refresh)
	GetSessionByRefreshHash(ctx context.Context, hash string) (*Session, error)
	// Обновляет refresh токен и jwt токен
	RotateToken(ctx context.Context, sessionid uuid.UUID, oldhash, newHash string, rotatedAt time.Time) error
	// Отзывает одну конкретную сессию (logout)
	RevokeSession(ctx context.Context, id uuid.UUID) error
	// Отзывает все сессии пользователя (logout from all)
	RevokeAllByUser(ctx context.Context, id uuid.UUID) (int64, error)
	// Удаляет устаревшие сессии (cron или сервисный вызов)
	DeleteExpired(ctx context.Context) (int64, error)
}

type ObjectStorageInterface interface {
	// Взаимодействие с S3 хранилищем

	// Добавляем объект
	PutObject(ctx context.Context, bucket, key string, body io.Reader, size int64, contentType string) error
	// Удалем объект
	DeleteObject(ctx context.Context, bucket, key string) error
	// Получаем заранее подписанную строку с доступом к файлу
	GetPresignedURL(ctx context.Context, bucket, key string, expires time.Duration) (string, error)
}

type ServiceInterface interface {
	// Взаимодействие со Storage

	// Обновление аватара
	UpdateAvatar(ctx context.Context, userID uuid.UUID, body io.Reader, size int64, contentType string, act *security.Actor) error
	// Получение URL аватара
	GetAvatarURL(ctx context.Context, userID uuid.UUID, act *security.Actor) (string, error)

	// Взаимодействие с user

	// СОздаём пользователя
	CreateUser(ctx context.Context, email, password, fullName string, act *security.Actor) error
	// Получаем пользователь по id
	GetUser(ctx context.Context, id uuid.UUID, act *security.Actor) (*User, error)
	// Обновляем пользователя
	UpdateUser(ctx context.Context, user *User, act *security.Actor) error
	// Удаляем пользователя
	DeleteUser(ctx context.Context, id uuid.UUID, act *security.Actor) error
	// Получаем пользователя по e-mail
	GetUserByEmail(ctx context.Context, email string, act *security.Actor) (*User, error)
	// Регистрация
	SignUp(ctx context.Context, email, password, fullName string) error
	// Авторизация
	SignIn(ctx context.Context, email, password string, meta RequestMeta) (Tokens, error)

	// Взаимодействие с session

	// Создаёт новую сессию
	CreateSession(ctx context.Context, session *Session) error
	// Получает сессию по ID (обычно UUID записи)
	GetSession(ctx context.Context, id uuid.UUID) (*Session, error)
	// Получает по хешу refresh токена (HMAC от refresh)
	GetByRefreshHash(ctx context.Context, hash string) (*Session, error)
	// Обновляет refresh токен и jti при ротации
	RotateToken(ctx context.Context, refreshtoken string) (Tokens, error)
	// Отзывает одну конкретную сессию (logout)
	RevokeSession(ctx context.Context, hash string, act *security.Actor) error
	// Отзывает все сессии пользователя (logout from all)
	RevokeAllByUser(ctx context.Context, id uuid.UUID, act *security.Actor) (int64, error)
	// Удаляет устаревшие сессии (cron или сервисный вызов)
	CleanupExpiredSessions(ctx context.Context) error
}
