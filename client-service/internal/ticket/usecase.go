package ticket

import (
	"context"

	"github.com/google/uuid"
)

type Usecase struct {
	repo Repository
}

func NewUsecase(repo Repository) Usecase {
	return Usecase{repo}
}

func (u *Usecase) Create(ctx context.Context, ticket Ticket) (Ticket, error) {
	createdTicket, err := u.repo.Create(ctx, ticket)
	if err != nil {
		return Ticket{}, err
	}
	return createdTicket, nil
}

func (u *Usecase) GetByUserId(ctx context.Context, id uuid.UUID) ([]Ticket, error) {
	tickets, err := u.repo.GetByUserId(ctx, id)
	if err != nil {
		return tickets, err
	}
	return tickets, nil
}

func (u *Usecase) Update(ctx context.Context, ticket Ticket) (Ticket, error) {
	updatedTicket, err := u.repo.Update(ctx, ticket)
	if err != nil {
		return Ticket{}, err
	}
	return updatedTicket, nil
}

func (u *Usecase) Delete(ctx context.Context, id uuid.UUID) (Ticket, error) {
	deletedTicket, err := u.repo.Delete(ctx, id)
	if err != nil {
		return Ticket{}, err
	}
	return deletedTicket, nil
}

func (u *Usecase) GetByIdAndUserId(ctx context.Context, ticketId uuid.UUID, userId uuid.UUID) (Ticket, error) {
	ticket, err := u.repo.GetByIdAndUserId(ctx, ticketId, userId)
	return ticket, err
}

func (u *Usecase) UpdateByUserID(ctx context.Context, userID uuid.UUID, ticket Ticket) (Ticket, error) {
	updatedTicket, err := u.repo.UpdateByUserID(ctx, userID, ticket)
	if err != nil {
		return Ticket{}, err
	}
	return updatedTicket, nil
}

func (u *Usecase) UpdateById(ctx context.Context, ticket Ticket) (Ticket, error) {
	updatedTicket, err := u.repo.UpdateById(ctx, ticket)
	if err != nil {
		return Ticket{}, err
	}
	return updatedTicket, nil
}
