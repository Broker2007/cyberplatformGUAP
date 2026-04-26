package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tatKOMre/cyberplatform/backend/internal/auth/domain"
	"github.com/tatKOMre/cyberplatform/backend/internal/platform/identity/security"
)

func (h *Handler) SignUp(c *gin.Context) {
	var user SignUpRequest
	ctx := c.Request.Context()
	err := c.ShouldBindJSON(&user)
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}
	err = h.Service.SignUp(ctx, user.Email, user.Password, user.Fullname)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"status": "Created",
	})
}

func (h *Handler) SignIn(c *gin.Context) {
	req := domain.RequestMeta{
		UserAgent: c.Request.UserAgent(),
		IP:        c.ClientIP(),
	}
	ctx := c.Request.Context()
	var s SignInRequest
	err := c.ShouldBindJSON(&s)
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	tokens, err := h.Service.SignIn(ctx, s.Email, s.Password, req)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.SetCookie(h.Cookie.Name,
		tokens.RefreshToken,
		h.Cookie.RefreshMaxAge,
		h.Cookie.Path,
		h.Cookie.Domain,
		h.Cookie.Secure,
		h.Cookie.HttpOnly,
	)
	c.JSON(http.StatusOK, gin.H{
		"status": "Пользователь авторизован",
		"token":  tokens.AccessToken,
	})
}

func (h *Handler) RotateToken(c *gin.Context) {
	ctx := c.Request.Context()
	refreshToken, err := c.Cookie(h.Cookie.Name)
	if err != nil {
		HandleError(c, domain.ErrUnauthorized)
		return
	}
	tokens, err := h.Service.RotateToken(ctx, refreshToken)
	if err != nil {
		c.SetCookie(
			h.Cookie.Name,
			"",
			-1,
			h.Cookie.Path,
			h.Cookie.Domain,
			h.Cookie.Secure,
			h.Cookie.HttpOnly,
		)
		HandleError(c, err)
		return
	}
	c.SetCookie(h.Cookie.Name,
		tokens.RefreshToken,
		h.Cookie.RefreshMaxAge,
		h.Cookie.Path,
		h.Cookie.Domain,
		h.Cookie.Secure,
		h.Cookie.HttpOnly,
	)
	c.JSON(http.StatusOK, gin.H{
		"status": "Сессия и токен обновлены",
		"token":  tokens.AccessToken,
	})
}

func (h *Handler) Profile(c *gin.Context) {
	ctx := c.Request.Context()
	actor, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}

	user, err := h.Service.GetUser(ctx, actor.UserID, actor)
	if err != nil {
		HandleError(c, err)
		return
	}

	avatarURL, err := h.Service.GetAvatarURL(ctx, user.ID, actor)
	if err != nil {
		HandleError(c, err)
		return
	}
	response := UserProfileResponse{
		Email:    user.Email,
		Fullname: user.FullName,
		Role:     user.Role,
	}

	if avatarURL != "" {
		response.Avatar = &avatarURL
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) Logout(c *gin.Context) {
	ctx := c.Request.Context()
	actor, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}
	refreshtoken, err := c.Cookie(h.Cookie.Name)
	if err != nil {
		HandleError(c, domain.ErrUnauthorized)
		return
	}
	err = h.Service.RevokeSession(ctx, refreshtoken, actor)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.SetCookie(h.Cookie.Name,
		"",
		-1,
		h.Cookie.Path,
		h.Cookie.Domain,
		h.Cookie.Secure,
		h.Cookie.HttpOnly,
	)
	c.JSON(http.StatusOK, gin.H{
		"status": "Пользователь вышел из профиля",
	})
}

func (h *Handler) LogoutAllSessions(c *gin.Context) {
	ctx := c.Request.Context()
	actor, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}
	count, err := h.Service.RevokeAllByUser(ctx, actor.UserID, actor)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.SetCookie(h.Cookie.Name,
		"",
		-1,
		h.Cookie.Path,
		h.Cookie.Domain,
		h.Cookie.Secure,
		h.Cookie.HttpOnly,
	)
	c.JSON(http.StatusOK, gin.H{
		"status":         "Пользователь вышел из всех аккунтов",
		"RevokeSessions": count,
	})
}

func (h *Handler) UpdateAvatar(c *gin.Context) {
	ctx := c.Request.Context()

	actor, ok := security.ActorFromGinContext(c)
	if !ok {
		HandleError(c, domain.ErrUnauthorized)
		return
	}

	fileHeader, err := c.FormFile("avatar")
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		HandleError(c, domain.ErrInvalidRequest)
		return
	}
	defer file.Close()

	contentType := fileHeader.Header.Get("Content-Type")

	err = h.Service.UpdateAvatar(
		ctx,
		actor.UserID,
		file,
		fileHeader.Size,
		contentType,
		actor,
	)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "avatar updated",
	})
}
