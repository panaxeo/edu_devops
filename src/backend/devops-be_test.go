package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHomeRoute_WillReturnWelcomeMessage(t *testing.T) {
	router := setupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)
	router.ServeHTTP(w, req)

	expectedResult := getMessage()
	actualResponse := strings.Trim(w.Body.String(), "\"")

	assert.Equal(t, 200, w.Code)
	assert.Equal(t, expectedResult, actualResponse)
}
