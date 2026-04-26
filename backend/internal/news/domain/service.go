package domain

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
)

type Service struct {
	Repository  RepositoryInterface
	Storage     ObjectStorageInterface
	ImageBucket string
}

func New(repo RepositoryInterface, storage ObjectStorageInterface, imageBucket string) *Service {
	return &Service{
		Repository:  repo,
		Storage:     storage,
		ImageBucket: imageBucket,
	}
}

type NewsImageDTO struct {
	ID  uuid.UUID `json:"id"`
	URL string    `json:"url"`
}

type PublicationDTO struct {
	ID        uuid.UUID      `json:"id"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	CreatedAt time.Time      `json:"createdAt"`
	Images    []NewsImageDTO `json:"images"`
}

type PublicationListResult struct {
	Items      []PublicationDTO `json:"items"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"pageSize"`
	TotalPages int              `json:"totalPages"`
}

func fileExtension(contentType string) (string, error) {
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

type AddImageInput struct {
	Body        io.Reader
	Size        int64
	ContentType string
}

func (s *Service) AddImage(
	ctx context.Context,
	publicationID uuid.UUID,
	body io.Reader,
	size int64,
	contentType string,
	act *security.Actor,
) error {
	if !act.IsSystem() && !act.IsAdmin() {
		return ErrPermissionDenied
	}

	if _, err := s.Repository.GetPublication(ctx, publicationID); err != nil {
		return err
	}

	return s.addImage(ctx, publicationID, AddImageInput{
		Body:        body,
		Size:        size,
		ContentType: contentType,
	})
}

func (s *Service) AddImages(
	ctx context.Context,
	publicationID uuid.UUID,
	files []AddImageInput,
	act *security.Actor,
) error {
	if !act.IsSystem() && !act.IsAdmin() {
		return ErrPermissionDenied
	}

	if len(files) == 0 {
		return ErrInvalidRequest
	}

	if _, err := s.Repository.GetPublication(ctx, publicationID); err != nil {
		return err
	}

	for _, file := range files {
		if err := s.addImage(ctx, publicationID, file); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) addImage(
	ctx context.Context,
	publicationID uuid.UUID,
	file AddImageInput,
) error {
	if file.Size <= 0 || file.Size > 5*1024*1024 {
		return ErrInvalidRequest
	}

	ext, err := fileExtension(file.ContentType)
	if err != nil {
		return err
	}

	imageID := uuid.New()
	key := fmt.Sprintf("images/%s/news/%s%s", publicationID.String(), imageID.String(), ext)

	if err := s.Storage.PutObject(ctx, s.ImageBucket, key, file.Body, file.Size, file.ContentType); err != nil {
		return err
	}

	img := &NewsImage{
		ID:            imageID,
		PublicationID: publicationID,
		Key:           key,
		CreatedAt:     time.Now().UTC(),
	}

	if err := s.Repository.AddImage(ctx, publicationID, img); err != nil {
		_ = s.Storage.DeleteObject(ctx, s.ImageBucket, key)
		return err
	}

	return nil
}

func (s *Service) ListNewsImages(
	ctx context.Context,
	publicationID uuid.UUID,
) ([]NewsImageDTO, error) {
	if _, err := s.Repository.GetPublication(ctx, publicationID); err != nil {
		return nil, err
	}

	images, err := s.Repository.ListImages(ctx, publicationID)
	if err != nil {
		return nil, err
	}

	result := make([]NewsImageDTO, 0, len(images))

	for _, img := range images {
		if img.Key == "" {
			continue
		}

		url, err := s.Storage.GetPresignedURL(ctx, s.ImageBucket, img.Key, 15*time.Minute)
		if err != nil {
			log.Printf(
				"get news image presigned url failed: bucket=%s key=%s err=%v",
				s.ImageBucket,
				img.Key,
				err,
			)
			continue
		}

		result = append(result, NewsImageDTO{
			ID:  img.ID,
			URL: url,
		})
	}

	return result, nil
}

func (s *Service) CreatePublication(ctx context.Context, title, content string, act *security.Actor) (string, error) {
	if !act.IsSystem() && !act.IsAdmin() {
		return "", ErrPermissionDenied
	}
	publication := &Publication{
		ID:        uuid.New(),
		Title:     title,
		Content:   content,
		CreatedAt: time.Now().UTC(),
	}
	if err := s.Repository.CreatePublication(ctx, publication); err != nil {
		return "", err
	}
	return publication.ID.String(), nil
}

func (s *Service) ListPublications(
	ctx context.Context,
	page, pageSize int,
) (*PublicationListResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100
	}

	publications, total, err := s.Repository.ListPublications(ctx, page, pageSize)
	if err != nil {
		return nil, err
	}

	items := make([]PublicationDTO, 0, len(publications))

	for _, pub := range publications {
		images, err := s.Repository.ListImages(ctx, pub.ID)
		if err != nil {
			return nil, err
		}

		imageDTOs := make([]NewsImageDTO, 0, len(images))

		for _, img := range images {
			if img.Key == "" {
				continue
			}

			url, err := s.Storage.GetPresignedURL(ctx, s.ImageBucket, img.Key, 15*time.Minute)
			if err != nil {
				log.Printf(
					"get news image presigned url failed: bucket=%s key=%s err=%v",
					s.ImageBucket,
					img.Key,
					err,
				)
				continue
			}

			imageDTOs = append(imageDTOs, NewsImageDTO{
				ID:  img.ID,
				URL: url,
			})
		}

		items = append(items, PublicationDTO{
			ID:        pub.ID,
			Title:     pub.Title,
			Content:   pub.Content,
			CreatedAt: pub.CreatedAt,
			Images:    imageDTOs,
		})
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &PublicationListResult{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *Service) DeletePublication(ctx context.Context, publicationID uuid.UUID, act *security.Actor) error {
	if !act.IsSystem() && !act.IsAdmin() {
		return ErrPermissionDenied
	}

	images, err := s.Repository.DeletePublication(ctx, publicationID)
	if err != nil {
		return err
	}

	for _, image := range images {
		if image.Key == "" {
			continue
		}
		if err := s.Storage.DeleteObject(ctx, s.ImageBucket, image.Key); err != nil {
			log.Printf("delete news image object failed after publication delete: publication_id=%s image_id=%s bucket=%s key=%s err=%v", publicationID, image.ID, s.ImageBucket, image.Key, err)
		}
	}

	return nil
}

func (s *Service) DeleteImage(ctx context.Context, publicationID, imageID uuid.UUID, act *security.Actor) error {
	if !act.IsSystem() && !act.IsAdmin() {
		return ErrPermissionDenied
	}

	image, err := s.Repository.DeleteImage(ctx, publicationID, imageID)
	if err != nil {
		return err
	}

	if image.Key == "" {
		return nil
	}

	if err := s.Storage.DeleteObject(ctx, s.ImageBucket, image.Key); err != nil {
		log.Printf("delete news image object failed after image delete: publication_id=%s image_id=%s bucket=%s key=%s err=%v", publicationID, image.ID, s.ImageBucket, image.Key, err)
	}

	return nil
}
