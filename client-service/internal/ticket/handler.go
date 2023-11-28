package ticket

import (
	"net/http"

	"client-service/internal/handler"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type Handle struct {
	ticketUsecase Usecase
	logger        *logrus.Logger
}

type CreateTicketRequest struct {
	UID    uuid.UUID    `json:"uid" validate:"required"`
	Status TicketStatus `json:"status" validate:"required"`
	Link   string       `json:"link"`
}

type UpdateTicketRequest struct {
	Status TicketStatus `json:"status"`
	Link   string       `json:"link"`
}

func NewHandle(ticketUsecase Usecase, logger *logrus.Logger) Handle {
	return Handle{ticketUsecase: ticketUsecase, logger: logger}
}

func (h *Handle) CreateTicketHandler(c echo.Context) error {
	var req CreateTicketRequest
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

	ticket := Ticket{
		UID:    req.UID,
		Status: req.Status,
		Link:   req.Link,
	}

	res, err := h.ticketUsecase.Create(ctx, ticket)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusCreated, handler.SuccessResponse{Data: res})
}

func (h *Handle) GetTicketHandler(c echo.Context) error {
	paramId := c.Param("id")
	id, err := uuid.Parse(paramId)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}
	ctx := c.Request().Context()

	res, err := h.ticketUsecase.GetByID(ctx, id)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusOK, handler.SuccessResponse{Data: res})
}

func (h *Handle) UpdateTicketHandler(c echo.Context) error {
	var req UpdateTicketRequest
	ctx := c.Request().Context()

	if err := c.Bind(&req); err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid content type"})
	}

	paramId := c.Param("id")
	id, err := uuid.Parse(paramId)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	ticket := Ticket{
		ID:     id,
		Status: req.Status,
		Link:   req.Link,
	}

	res, err := h.ticketUsecase.Update(ctx, ticket)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusOK, handler.SuccessResponse{Data: res})
}

func (h *Handle) DeleteTicketHandler(c echo.Context) error {
	paramId := c.Param("id")
	id, err := uuid.Parse(paramId)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}
	ctx := c.Request().Context()

	res, err := h.ticketUsecase.Delete(ctx, id)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	return c.JSON(http.StatusOK, handler.SuccessResponse{Data: res})
}
