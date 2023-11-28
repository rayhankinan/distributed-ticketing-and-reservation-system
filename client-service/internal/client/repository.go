package client

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, user Client) (Client, error)
	GetByID(ctx context.Context, id uuid.UUID) (Client, error)
	Update(ctx context.Context, user Client) (Client, error)
	Delete(ctx context.Context, id uuid.UUID) (Client, error)
	FindByUsername(ctx context.Context, username string) (Client, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db}
}

func (r *repository) Create(ctx context.Context, client Client) (Client, error) {
	if err := r.db.WithContext(ctx).Create(&client).Error; err != nil {
		return Client{}, err
	}

	return client, nil
}

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (Client, error) {
	var client Client

	if err := r.db.WithContext(ctx).First(&client, "id = ?", id).Error; err != nil {
		return Client{}, err
	}

	return client, nil
}

func (r *repository) Update(ctx context.Context, client Client) (Client, error) {
	if err := r.db.WithContext(ctx).Save(&client).Error; err != nil {
		return Client{}, err
	}

	return client, nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) (Client, error) {
	var client Client

	if err := r.db.WithContext(ctx).Delete(&client, id).Error; err != nil {
		return Client{}, err
	}

	return client, nil
}

func (r *repository) FindByUsername(ctx context.Context, username string) (Client, error) {
	var client Client
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&client).Error
	if err != nil {
		return Client{}, err
	}
	return client, nil
}
