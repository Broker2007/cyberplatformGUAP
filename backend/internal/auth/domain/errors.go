package domain

import "errors"

var (
	ErrNotFound         = errors.New("not found")
	ErrEmailAlreadyUsed = errors.New("email already used")
	ErrInvalidPassword  = errors.New("invalid email or password")
	ErrPermissionDenied = errors.New("permission denied")
	ErrInvalidRequest   = errors.New("invalid request")
	ErrUnauthorized     = errors.New("user unauthorized")
)
