package domain

import (
	"context"
	"io"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
)

type RepositoryInterface interface {
	// Взаимодействие с публикациями

	// Создаём публикацию
	CreatePublication(ctx context.Context, publication *Publication) error
	// Получаем публикацию
	GetPublication(ctx context.Context, id uuid.UUID) (*Publication, error)
	// Получаем все публикации
	ListPublications(ctx context.Context, page, pageSize int) ([]Publication, int64, error)
	// Удаляем публикацию вместе с изображениями в одной транзакции
	DeletePublication(ctx context.Context, id uuid.UUID) ([]NewsImage, error)

	// Взаимодействие с изображениями

	// Добавляем изображение к публикации
	AddImage(ctx context.Context, publicationID uuid.UUID, image *NewsImage) error
	// Получаем изображение
	GetImage(ctx context.Context, newsImageID uuid.UUID) (*NewsImage, error)
	// Получаем все изображения для публикации
	ListImages(ctx context.Context, publicationID uuid.UUID) ([]NewsImage, error)
	// Удаляем изображение публикации и возвращаем его данные
	DeleteImage(ctx context.Context, publicationID, imageID uuid.UUID) (*NewsImage, error)
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
	// Взаимодействие с NewsImage

	// Добавить изображение
	AddImage(ctx context.Context, publicationID uuid.UUID, body io.Reader, size int64, contentType string, act *security.Actor) error
	// Добавить изображения
	AddImages(ctx context.Context, PublicationID uuid.UUID, files []AddImageInput, act *security.Actor) error
	// Получить изображение
	ListNewsImages(ctx context.Context, publicationID uuid.UUID) ([]NewsImageDTO, error)

	// Взаимодействие с публикациями

	// Создание публикации
	CreatePublication(ctx context.Context, title, content string, act *security.Actor) (string, error)
	// Получение всех публикаций
	ListPublications(ctx context.Context, page, pageSize int) (*PublicationListResult, error)
	// Удаление публикации
	DeletePublication(ctx context.Context, publicationID uuid.UUID, act *security.Actor) error
	// Удаление изображения публикации
	DeleteImage(ctx context.Context, publicationID, imageID uuid.UUID, act *security.Actor) error
}
