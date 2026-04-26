package http

// Файл объявления структур обмена данных

type SignUpRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Fullname string `json:"fullName" binding:"required,min=2,max=100"`
	Password string `json:"password" binding:"required,min=8,max=72"`
}

type SignInRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=72"`
}

type UserProfileResponse struct {
	Email    string  `json:"email"`
	Fullname string  `json:"fullName"`
	Role     bool    `json:"role"`
	Avatar   *string `json:"avatar"`
}
