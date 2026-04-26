package hash

import (
	"crypto/sha256"
	"encoding/base64"

	"golang.org/x/crypto/bcrypt"
)

// Hash - функция для хэширования строки с помощью SHA1 - алгоритма
func Hash(text string) string {
	hasher := sha256.New()
	hasher.Write([]byte(text))
	sha := base64.URLEncoding.EncodeToString(hasher.Sum(nil))
	return sha
}

const passwordCost = 12

// HashPassword хэширует пароль для хранения в БД.
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), passwordCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPassword сравнивает сырой пароль и хэш из БД.
func CheckPassword(password, hashed string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password))
}
