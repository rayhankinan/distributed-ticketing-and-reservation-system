package ticket

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, ticket Ticket) (Ticket, error)
	GetByUserId(ctx context.Context, uid uuid.UUID) (Ticket, error)
	Update(ctx context.Context, ticket Ticket) (Ticket, error)
	Delete(ctx context.Context, id uuid.UUID) (Ticket, error)
	UpdateByUserID(ctx context.Context, userID uuid.UUID, ticket Ticket) (Ticket, error)
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

func (r *repository) GetByUserId(ctx context.Context, uid uuid.UUID) (Ticket, error) {
	var ticket Ticket

	if err := r.db.WithContext(ctx).First(&ticket, "uid = ?", uid).Error; err != nil {
		return Ticket{}, err
	}

	return ticket, nil
}

func (r *repository) Update(ctx context.Context, ticket Ticket) (Ticket, error) {
	if err := r.db.WithContext(ctx).Save(&ticket).Error; err != nil {
		return Ticket{}, err
	}

	return ticket, nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) (Ticket, error) {
	var ticket Ticket

	if err := r.db.WithContext(ctx).Delete(&ticket, id).Error; err != nil {
		return Ticket{}, err
	}

	return ticket, nil
}

func (r *repository) UpdateByUserID(ctx context.Context, userID uuid.UUID, updatedTicket Ticket) (Ticket, error) {
	var ticket Ticket

	if err := r.db.WithContext(ctx).Where("uid = ? AND status = ?", userID, OnGoing).First(&ticket).Error; err != nil {
		return Ticket{}, err
	}

	ticket.Status = updatedTicket.Status
	ticket.Link = updatedTicket.Link

	if err := r.db.WithContext(ctx).Save(&ticket).Error; err != nil {
		return Ticket{}, err
	}

	return ticket, nil
}
