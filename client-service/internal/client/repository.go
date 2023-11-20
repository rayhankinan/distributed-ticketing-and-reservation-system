package client

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user Client) error
	GetByID(id uuid.UUID) (Client, error)
	Update(user Client) error
	Delete(id uuid.UUID) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db}
}

func (r *userRepository) Create(client Client) error {
	return r.db.Create(client).Error
}

func (r *userRepository) GetByID(id uuid.UUID) (Client, error) {
	var client Client
	err := r.db.First(&client, "id = ?", id).Error
	return client, err
}

func (r *userRepository) Update(client Client) error {
	return r.db.Save(client).Error
}

func (r *userRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&Client{}, id).Error
}
