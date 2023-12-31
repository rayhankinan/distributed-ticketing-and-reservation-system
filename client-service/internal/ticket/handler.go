package ticket

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"client-service/internal/handler"
	"client-service/internal/jwt"

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
	SeatID uuid.UUID `json:"seat_id" validate:"required"`
}

type UpdateTicketRequest struct {
	SeatID uuid.UUID    `json:"seat_id"`
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

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	headerParts := strings.Split(authHeader, " ")
	if len(headerParts) != 2 {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	token := headerParts[1]
	parsedUID, err := jwt.GetUserIDFromJWT(token)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	UID, err := uuid.Parse(parsedUID)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	ticket := Ticket{
		UID:    UID,
		SeatID: req.SeatID,
		Status: OnGoing,
		Link:   "",
	}

	res, err := h.ticketUsecase.Create(ctx, ticket)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	jsonBody, _ := json.Marshal(
		map[string]uuid.UUID{
			"id": req.SeatID,
		},
	)
	bodyReader := bytes.NewReader(jsonBody)

	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to marshal reserve payload"})
	}

	url := "http://api.ticket-service.docker-compose:3000/seat/reserve"

	reserveReq, err := http.NewRequest("POST", url, bodyReader)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to create reserve request"})
	}
	reserveReq.Header.Set("Content-Type", "application/json")
	reserveReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	client := &http.Client{}
	reserveResp, err := client.Do(reserveReq)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to send reserve request"})
	}
	defer reserveResp.Body.Close()

	if reserveResp.StatusCode != http.StatusCreated {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to reserve seat"})
	}

	return c.JSON(http.StatusCreated, handler.SuccessResponse{Data: res})
}

func (h *Handle) GetTicketHandler(c echo.Context) error {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	headerParts := strings.Split(authHeader, " ")
	if len(headerParts) != 2 {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	token := headerParts[1]
	parsedUID, err := jwt.GetUserIDFromJWT(token)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	UID, err := uuid.Parse(parsedUID)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	ctx := c.Request().Context()

	res, err := h.ticketUsecase.GetByUserId(ctx, UID)
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

func (h *Handle) RefundTicketHandler(c echo.Context) error {
	paramId := c.Param("id")
	ticketId, err := uuid.Parse(paramId)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	ctx := c.Request().Context()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	headerParts := strings.Split(authHeader, " ")
	if len(headerParts) != 2 {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	token := headerParts[1]
	parsedUID, err := jwt.GetUserIDFromJWT(token)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	UID, err := uuid.Parse(parsedUID)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	ticket, err := h.ticketUsecase.GetByIdAndUserId(ctx, ticketId, UID)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	// Change ticket status to ON_GOING to notify user that it's currently on going
	ticket.Status = OnGoing

	res, err := h.ticketUsecase.UpdateById(ctx, ticket)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	jsonBody, _ := json.Marshal(
		map[string]uuid.UUID{
			"id": ticket.SeatID,
		},
	)
	bodyReader := bytes.NewReader(jsonBody)

	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to marshal reserve payload"})
	}

	url := "http://api.ticket-service.docker-compose:3000/seat/cancel"

	reserveReq, err := http.NewRequest("POST", url, bodyReader)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to create cancel request"})
	}
	reserveReq.Header.Set("Content-Type", "application/json")
	reserveReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	client := &http.Client{}
	reserveResp, err := client.Do(reserveReq)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to send reserve request"})
	}
	defer reserveResp.Body.Close()

	if reserveResp.StatusCode != http.StatusCreated {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: "Failed to cancel seat"})
	}

	return c.JSON(http.StatusCreated, handler.SuccessResponse{Data: res})
}

func (h *Handle) UpdateTicketByUserIDHandler(c echo.Context) error {
	var req UpdateTicketRequest
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

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	headerParts := strings.Split(authHeader, " ")
	if len(headerParts) != 2 {
		h.logger.Error("Unauthorized")
		return c.JSON(http.StatusUnauthorized, handler.ErrorResponse{Message: "Unauthorized"})
	}

	token := headerParts[1]
	parsedUID, err := jwt.GetUserIDFromJWT(token)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	UID, err := uuid.Parse(parsedUID)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusBadRequest, handler.ErrorResponse{Message: "Invalid ID"})
	}

	ticket := Ticket{
		Status: req.Status,
		Link:   req.Link,
		SeatID: req.SeatID,
	}

	res, err := h.ticketUsecase.UpdateByUserID(ctx, UID, ticket)
	if err != nil {
		h.logger.Error(err)
		return c.JSON(http.StatusInternalServerError, handler.ErrorResponse{Message: err.Error()})
	}

	fmt.Printf("[!] Webhook called. Updated ticket: %+v\n", res)

	return c.JSON(http.StatusOK, handler.SuccessResponse{Data: res})
}
