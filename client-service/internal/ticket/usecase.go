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

func (u *Usecase) GetByID(ctx context.Context, id uuid.UUID) (Ticket, error) {
	ticket, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return Ticket{}, err
	}
	return ticket, nil
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
