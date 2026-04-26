package domain

import "time"

type Config struct {
	SignKey    []byte
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}
