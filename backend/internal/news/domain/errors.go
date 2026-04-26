package domain

import "errors"

var (
	ErrNotFound         = errors.New("not found")
	ErrPermissionDenied = errors.New("permission denied")
	ErrInvalidRequest   = errors.New("invalid request")
	ErrUnauthorized     = errors.New("user unauthorized")
)
