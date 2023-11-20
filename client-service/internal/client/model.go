package client

import (
	"client-service/internal/ticket"

	"github.com/google/uuid"
)

type Client struct {
	ID       uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	Username string
	Password string
	Tickets  []ticket.Ticket `gorm:"foreignKey:UID"`
}
