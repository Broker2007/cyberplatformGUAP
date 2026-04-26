package token

import (
	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(claim *Claims, key []byte) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)

	strToken, err := token.SignedString(key)
	if err != nil {
		return "", err
	}
	return strToken, nil
}

func ParseJWT(strToken string, key []byte) (*Claims, error) {
	claim := &Claims{}
	parsedToken, err := jwt.ParseWithClaims(strToken, claim, func(strToken *jwt.Token) (interface{}, error) {
		return key, nil
	})
	if err != nil {
		return nil, err
	}
	if !parsedToken.Valid {
		return nil, err
	}
	return claim, nil
}
