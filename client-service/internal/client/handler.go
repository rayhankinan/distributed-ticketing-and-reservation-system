package client

import (
	"net/http"

	"client-service/internal/handler"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type Handle struct {
	useCase Usecase
	logger  *logrus.Logger
}

type CreateUserRequest struct {
	Username string `json:"username" validate:"required, printascii"`
	Password string `json:"password" validate:"required, printascii"`
}

type UpdateUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (u UpdateUserRequest) CheckEmpty() bool {
	return u.Username == "" && u.Password == ""
}

func NewHandle(useCase Usecase, logger *logrus.Logger) *Handle {
	return &Handle{useCase: useCase, logger: logger}
}

func (h *Handle) CreateUserHandler(c echo.Context) error {
	var req CreateUserRequest
	ctx := c.Request().Context()

	if err := c.Bind(&req); err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid content type"})
	}

	v := validator.New()
	if err := v.Struct(req); err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid request body"})
	}

	client := Client{
		Username: req.Username,
		Password: req.Password,
	}

	res, err := h.useCase.Create(ctx, client)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusCreated, handler.SuccessResponse{Data: res})
}

func (h *Handle) GetUserHandler(c echo.Context) error {
	paramId := c.QueryParam("id")
	id, err := uuid.Parse(paramId)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}
	ctx := c.Request().Context()

	res, err := h.useCase.GetByID(ctx, id)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusOK, handler.SuccessResponse{Data: res})
}

func (h *Handle) DeleteUserHandler(c echo.Context) error {
	paramId := c.QueryParam("id")
	id, err := uuid.Parse(paramId)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}
	ctx := c.Request().Context()

	res, err := h.useCase.Delete(ctx, id)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusOK, handler.SuccessResponse{Data: res})
}

func (h *Handle) UpdateUserHandler(c echo.Context) error {
	var req UpdateUserRequest

	ctx := c.Request().Context()

	if err := c.Bind(&req); err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid content type"})
	}

	if req.CheckEmpty() {
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid request body"})
	}

	v := validator.New()
	if err := v.Struct(req); err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid request body"})
	}

	client := Client{
		Username: req.Username,
		Password: req.Password,
	}

	paramId := c.QueryParam("id")
	id, err := uuid.Parse(paramId)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	client.ID = id

	res, err := h.useCase.Update(ctx, client)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusOK, handler.SuccessResponse{Data: res})
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *Handle) LoginHandler(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "invalid content type"})
	}

	v := validator.New()
	if err := v.Struct(req); err != nil {
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "invalid request body"})
	}

	token, err := h.useCase.Login(req.Username, req.Password)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"token": token})
}
