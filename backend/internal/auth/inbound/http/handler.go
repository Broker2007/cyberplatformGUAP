package http

import "github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"

type Handler struct {
	Service domain.ServiceInterface
	Cookie  CookieConfig
}

type CookieConfig struct {
	Name          string
	Domain        string
	Path          string
	Secure        bool
	HttpOnly      bool
	RefreshMaxAge int
}

func New(service domain.ServiceInterface, cookie CookieConfig) *Handler {
	return &Handler{
		Service: service,
		Cookie:  cookie,
	}
}
