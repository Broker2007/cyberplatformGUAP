package domain

import "errors"

var (
	ErrNotFound             = errors.New("not found")
	ErrEmailAlreadyUsed     = errors.New("email already used")
	ErrInvalidPassword      = errors.New("invalid email or password")
	ErrPermissionDenied     = errors.New("permission denied")
	ErrInvalidRequest       = errors.New("invalid request")
	ErrUnauthorized         = errors.New("user unauthorized")
	ErrClientNotFound       = errors.New("sso client not found")
	ErrClientInactive       = errors.New("sso client inactive")
	ErrUserNotAuthenticated = errors.New("user not authenticated")
	ErrInvalidCode          = errors.New("invalid code")
	ErrCodeExpired          = errors.New("code expired")
	ErrCodeUsed             = errors.New("code already used")
)
