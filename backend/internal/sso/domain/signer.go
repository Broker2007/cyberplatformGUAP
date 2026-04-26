package domain

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTSigner struct {
	secret []byte
	issuer string
	ttl    time.Duration
}

func NewJWTSigner(secret []byte, issuer string, ttl time.Duration) *JWTSigner {
	return &JWTSigner{
		secret: secret,
		issuer: issuer,
		ttl:    ttl,
	}
}

func (s *JWTSigner) Sign(claims SSOClaims) (string, error) {
	now := time.Now()

	tokenClaims := jwt.MapClaims{
		"sub":      claims.Sub,
		"email":    claims.Email,
		"name":     claims.Name,
		"username": claims.Username,
		"iss":      s.issuer,
		"iat":      now.Unix(),
		"nbf":      now.Unix(),
		"exp":      now.Add(s.ttl).Unix(),
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
	return t.SignedString(s.secret)
}
