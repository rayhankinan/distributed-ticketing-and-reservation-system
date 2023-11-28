package ticket

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, ticket Ticket) (Ticket, error)
	GetByID(ctx context.Context, id uuid.UUID) (Ticket, error)
	Update(ctx context.Context, ticket Ticket) (Ticket, error)
	Delete(ctx context.Context, id uuid.UUID) (Ticket, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db}
}

func (r *repository) Create(ctx context.Context, ticket Ticket) (Ticket, error) {
	err := r.db.WithContext(ctx).Create(&ticket).Error
	if err != nil {
		return Ticket{}, err
	}
	return ticket, nil
}

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (Ticket, error) {
	var ticket Ticket
	err := r.db.WithContext(ctx).First(&ticket, "id = ?", id).Error
	return ticket, err
}

func (r *repository) Update(ctx context.Context, ticket Ticket) (Ticket, error) {
	err := r.db.WithContext(ctx).Save(&ticket).Error
	if err != nil {
		return Ticket{}, err
	}
	return ticket, nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) (Ticket, error) {
	var ticket Ticket
	err := r.db.WithContext(ctx).First(&ticket, "id = ?", id).Error
	if err != nil {
		return Ticket{}, err
	}
	if err = r.db.WithContext(ctx).Delete(&Ticket{}, id).Error; err != nil {
		return Ticket{}, err
	}
	return ticket, nil
}
