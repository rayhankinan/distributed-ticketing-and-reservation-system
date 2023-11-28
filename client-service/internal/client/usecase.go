package client

import (
	"context"
	"errors"

	"client-service/internal/jwt"
	"client-service/internal/security"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Usecase struct {
	repo Repository
}

func NewUsecase(repo Repository) Usecase {
	return Usecase{repo}
}

func (u *Usecase) Create(ctx context.Context, client Client) (Client, error) {
	hashedPassword, err := security.HashPassword(client.Password)
	if err != nil {
		return Client{}, err
	}

	client.Password = hashedPassword

	createdClient, err := u.repo.Create(ctx, client)
	if err != nil {
		return Client{}, err
	}
	return createdClient, nil
}

func (u *Usecase) GetByID(ctx context.Context, id uuid.UUID) (Client, error) {
	client, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return Client{}, err
	}
	return client, nil
}

func (u *Usecase) Update(ctx context.Context, client Client) (Client, error) {
	updatedClient, err := u.repo.Update(ctx, client)
	if err != nil {
		return Client{}, err
	}
	return updatedClient, nil
}

func (u *Usecase) Delete(ctx context.Context, id uuid.UUID) (Client, error) {
	deletedClient, err := u.repo.Delete(ctx, id)
	if err != nil {
		return Client{}, err
	}
	return deletedClient, nil
}

func (u *Usecase) Login(username, password string) (string, error) {
	user, err := u.repo.FindByUsername(username)
	if err != nil {
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	token, err := jwt.GenerateJWT(user.ID, string(user.Role))
	if err != nil {
		return "", err
	}

	return token, nil
}
