package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handle struct{}

type SuccessResponse struct {
	Data any `json:"data"`
}

type ErrorResponse struct {
	Message string `json:"message"`
}

func New() Handle {
	return Handle{}
}

func (h *Handle) PingHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, "pong")
}
