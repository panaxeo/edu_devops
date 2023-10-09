package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1"})
	router.Use(cors.Default())
	router.GET("/", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, "Welcome from Go!")
	})
	router.Run("localhost:8080")
}
