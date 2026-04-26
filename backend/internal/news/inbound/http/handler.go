package http

import "github.com/tatKOMre/cyberplatform/backend/internal/news/domain"

type Handler struct {
	Service domain.ServiceInterface
}

func New(service domain.ServiceInterface) *Handler {
	return &Handler{
		Service: service,
	}
}
