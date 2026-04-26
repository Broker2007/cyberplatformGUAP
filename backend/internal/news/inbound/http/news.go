package http

import (
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/internal/news/domain"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
)

func (h *Handler) CreatePublication(c *gin.Context) {
	pubdata := PublicationData{}
	err := c.ShouldBindJSON(&pubdata)
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	ctx := c.Request.Context()
	act, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}

	id, err := h.Service.CreatePublication(ctx, pubdata.Title, pubdata.Content, act)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status": "Публикация создана",
		"id":     id,
	})
}

func (h *Handler) ShowPublications(c *gin.Context) {
	page, _ := strconv.Atoi(c.Query("page"))
	pageSize, _ := strconv.Atoi(c.Query("pageSize"))

	result, err := h.Service.ListPublications(c.Request.Context(), page, pageSize)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) DeletePublication(c *gin.Context) {
	idParam := c.Param("id")
	if idParam == "" {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	publicationID, err := uuid.Parse(idParam)
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}
	act, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}

	ctx := c.Request.Context()

	if err := h.Service.DeletePublication(ctx, publicationID, act); err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status": "Публикация удалена",
	})
}

func (h *Handler) DeleteImage(c *gin.Context) {
	publicationID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	imageID, err := uuid.Parse(c.Param("imageID"))
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	act, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}

	if err := h.Service.DeleteImage(c.Request.Context(), publicationID, imageID, act); err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "Изображение удалено",
	})
}

func (h *Handler) AddImages(c *gin.Context) {
	ctx := c.Request.Context()

	idParam := c.Param("id")
	if idParam == "" {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	publicationID, err := uuid.Parse(idParam)
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	fileHeaders := form.File["images"]
	if len(fileHeaders) == 0 {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}
	if len(fileHeaders) > 4 {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}
	files := make([]domain.AddImageInput, 0, len(fileHeaders))
	closers := make([]io.Closer, 0, len(fileHeaders))

	defer func() {
		for _, closer := range closers {
			_ = closer.Close()
		}
	}()

	for _, fh := range fileHeaders {
		src, err := fh.Open()
		if err != nil {
			HandleError(c, err)
			return
		}

		closers = append(closers, src)

		files = append(files, domain.AddImageInput{
			Body:        src,
			Size:        fh.Size,
			ContentType: fh.Header.Get("Content-Type"),
		})
	}
	act, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}
	if err := h.Service.AddImages(ctx, publicationID, files, act); err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "images added",
	})
}
