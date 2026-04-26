package security

import (
	"github.com/google/uuid"
	"github.com/tatKOMre/cyberplatform/backend/pkg/token"
)

type Role string

const (
	RoleUser   Role = "user"
	RoleAdmin  Role = "admin"
	RoleSystem Role = "system"
)

var systemUserID = uuid.MustParse("00000000-0000-0000-0000-000000000001")

type Actor struct {
	UserID uuid.UUID
	Role   Role
}

func NewActorFromClaims(act *token.Claims) *Actor {
	role := RoleUser
	if act.Role {
		role = RoleAdmin
	}

	return &Actor{
		UserID: act.ID,
		Role:   role,
	}
}

func SystemActor() *Actor {
	return &Actor{
		UserID: systemUserID,
		Role:   RoleSystem,
	}
}

func (a *Actor) IsAdmin() bool  { return a.Role == RoleAdmin }
func (a *Actor) IsUser() bool   { return a.Role == RoleUser }
func (a *Actor) IsSystem() bool { return a.Role == RoleSystem }
