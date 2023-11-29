package client

import (
	"time"

	"client-service/internal/ticket"

	"github.com/google/uuid"
)

type Client struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	Username  string
	Password  string
	Role      Role
	Tickets   []ticket.Ticket `gorm:"foreignKey:UID"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Role string

const (
	Admin Role = "ADMIN"
	User  Role = "USER"
)
