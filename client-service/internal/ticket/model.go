package ticket

import (
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	UID       uuid.UUID
	SeatID    uuid.UUID
	Status    TicketStatus
	Link      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type TicketStatus string

const (
	OnGoing  TicketStatus = "ON_GOING"
	Success  TicketStatus = "SUCCESS"
	Failed   TicketStatus = "FAILED"
	Refunded TicketStatus = "REFUNDED"
)
