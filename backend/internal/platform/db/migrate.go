package db

import (
	authmodel "github.com/tatKOMre/cyberplatform/backend/internal/auth/outbound/db/postgres"
	newsmodel "github.com/tatKOMre/cyberplatform/backend/internal/news/outbound/db/postgres"
	ssomodel "github.com/tatKOMre/cyberplatform/backend/internal/sso/outbound/db/postgres"
	"gorm.io/gorm"
)

func AutoMigrates(db *gorm.DB) error {
	return db.AutoMigrate(
		&authmodel.UserModel{},
		&authmodel.SessionModel{},
		&newsmodel.PublicationModel{},
		&newsmodel.NewsImageModel{},
		&ssomodel.ClientModel{},
		&ssomodel.CodeModel{},
	)
}
