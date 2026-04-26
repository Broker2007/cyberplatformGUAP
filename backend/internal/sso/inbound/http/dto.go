package http

type ExchangeRequest struct {
	ClientID string `json:"client_id" binding:"required"`
	Code     string `json:"code" binding:"required"`
}
