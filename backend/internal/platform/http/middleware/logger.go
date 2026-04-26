package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func LoggerMW() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// 1. ДО — можем взять метод, IP, путь
		method := c.Request.Method
		path := c.Request.URL.Path
		remote := c.ClientIP()

		// 2. передаём дальше по цепочке
		c.Next()

		// 3. ПОСЛЕ — считаем время и выводим
		duration := time.Since(start)

		log.Printf("%s %s %s %v", method, remote, path, duration)
	}
}
