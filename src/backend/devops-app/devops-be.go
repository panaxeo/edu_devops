package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func getMessage() string {
	return "Welcome from Go!"
}

func setupRouter() *gin.Engine {
	router := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1"})
	router.Use(cors.Default())
	router.GET("/", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, getMessage())
	})

	return router
}

func main() {
	router := setupRouter()
	router.Run("localhost:8080")
}
