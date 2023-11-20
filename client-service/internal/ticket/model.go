package ticket

import (
	"github.com/google/uuid"
)

type Ticket struct {
	ID  uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	UID uuid.UUID
}
