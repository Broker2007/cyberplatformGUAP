package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/news/domain"
	"gorm.io/gorm"
)

type NewsImageModel struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey"`
	PublicationID uuid.UUID `gorm:"type:uuid;index;not null"`
	Key           string
	CreatedAt     time.Time
	UpdatedAt     *time.Time
	DeletedAt     gorm.DeletedAt
}

func toModelNewsImage(n *domain.NewsImage) *NewsImageModel {
	return &NewsImageModel{
		ID:            n.ID,
		PublicationID: n.PublicationID,
		Key:           n.Key,
		CreatedAt:     n.CreatedAt,
		UpdatedAt:     n.UpdatedAt,
	}
}

func toDomainNewsImage(n *NewsImageModel) *domain.NewsImage {
	return &domain.NewsImage{
		ID:            n.ID,
		PublicationID: n.PublicationID,
		Key:           n.Key,
		CreatedAt:     n.CreatedAt,
		UpdatedAt:     n.UpdatedAt,
	}
}

func (r *Repository) AddImage(ctx context.Context, publicationID uuid.UUID, image *domain.NewsImage) error {
	imagem := toModelNewsImage(image)
	err := r.DB.WithContext(ctx).Create(imagem).Error
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetImage(ctx context.Context, newsImageID uuid.UUID) (*domain.NewsImage, error) {
	imagem := &NewsImageModel{}

	err := r.DB.WithContext(ctx).First(imagem, newsImageID).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Мы НЕ принимаем решение
		// Мы просто говорим домену: "пользователь отсутствует"
		return nil, domain.ErrNotFound
	}

	if err != nil {
		return nil, err
	}
	image := toDomainNewsImage(imagem)
	return image, nil
}

func (r *Repository) ListImages(
	ctx context.Context,
	publicationID uuid.UUID,
) ([]domain.NewsImage, error) {
	var models []NewsImageModel

	err := r.DB.WithContext(ctx).
		Where("publication_id = ?", publicationID).
		Order("created_at ASC").
		Find(&models).Error
	if err != nil {
		return nil, err
	}

	images := make([]domain.NewsImage, 0, len(models))

	for _, i := range models {
		img := toDomainNewsImage(&i)
		if img != nil {
			images = append(images, *img)
		}
	}

	return images, nil
}

func (r *Repository) DeleteImage(ctx context.Context, publicationID, imageID uuid.UUID) (*domain.NewsImage, error) {
	var deleted *domain.NewsImage

	err := r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var model NewsImageModel
		if err := tx.Where("id = ? AND publication_id = ?", imageID, publicationID).First(&model).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return domain.ErrNotFound
			}
			return err
		}

		deleted = toDomainNewsImage(&model)
		if err := tx.Unscoped().Delete(&NewsImageModel{}, "id = ?", imageID).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return deleted, nil
}
