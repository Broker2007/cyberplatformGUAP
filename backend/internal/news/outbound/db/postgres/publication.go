package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/news/domain"
	"gorm.io/gorm"
)

type PublicationModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title     string
	Content   string
	CreatedAt time.Time
	UpdatedAt *time.Time
	DeletedAt gorm.DeletedAt
}

func toModel(p *domain.Publication) *PublicationModel {
	return &PublicationModel{
		ID:        p.ID,
		Title:     p.Title,
		Content:   p.Content,
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
	}
}

func toDomain(p *PublicationModel) *domain.Publication {
	return &domain.Publication{
		ID:        p.ID,
		Title:     p.Title,
		Content:   p.Content,
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
	}
}

func (r *Repository) CreatePublication(ctx context.Context, p *domain.Publication) error {
	publication := toModel(p)
	err := r.DB.WithContext(ctx).Create(publication).Error
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetPublication(ctx context.Context, id uuid.UUID) (*domain.Publication, error) {
	pub := &PublicationModel{}

	err := r.DB.WithContext(ctx).First(pub, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	publication := toDomain(pub)
	return publication, nil
}

func (r *Repository) ListPublications(
	ctx context.Context,
	page, pageSize int,
) ([]domain.Publication, int64, error) {
	offset := (page - 1) * pageSize

	// 1. считаем общее количество
	var total int64
	err := r.DB.WithContext(ctx).
		Model(&PublicationModel{}).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// 2. достаём страницу
	var models []PublicationModel
	err = r.DB.WithContext(ctx).
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&models).Error
	if err != nil {
		return nil, 0, err
	}

	// 3. маппим model → domain (прямо здесь)
	publications := make([]domain.Publication, 0, len(models))

	for _, p := range models {
		pub := toDomain(&p)
		if pub != nil {
			publications = append(publications, *pub)
		}
	}
	return publications, total, nil
}

func (r *Repository) DeletePublication(ctx context.Context, id uuid.UUID) ([]domain.NewsImage, error) {
	var deletedImages []domain.NewsImage

	err := r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var publication PublicationModel
		if err := tx.First(&publication, "id = ?", id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return domain.ErrNotFound
			}
			return err
		}

		var imageModels []NewsImageModel
		if err := tx.Where("publication_id = ?", id).Find(&imageModels).Error; err != nil {
			return err
		}

		deletedImages = make([]domain.NewsImage, 0, len(imageModels))
		for _, model := range imageModels {
			img := toDomainNewsImage(&model)
			if img != nil {
				deletedImages = append(deletedImages, *img)
			}
		}

		if len(imageModels) > 0 {
			if err := tx.Unscoped().Where("publication_id = ?", id).Delete(&NewsImageModel{}).Error; err != nil {
				return err
			}
		}

		if err := tx.Unscoped().Delete(&PublicationModel{}, "id = ?", id).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return deletedImages, nil
}
