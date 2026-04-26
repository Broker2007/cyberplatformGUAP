package security

import "github.com/gin-gonic/gin"

func ActorFromGinContext(c *gin.Context) (*Actor, bool) {
	value, ok := c.Get("actor")
	if !ok {
		return nil, false
	}

	actor, ok := value.(*Actor)
	if !ok {
		return nil, false
	}
	return actor, true
}
