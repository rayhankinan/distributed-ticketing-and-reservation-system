package migrations

import (
	"fmt"
	"log"

	"client-service/internal/client"
	"client-service/internal/ticket"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func MigrateUp() error {
	dsn := "host=localhost user=client-user password=client-password dbname=client port=5434 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	EnsureUUIDExtension(db)
	err = db.AutoMigrate(&client.Client{}, &ticket.Ticket{})
	if err != nil {
		return fmt.Errorf("failed to migrate database: %v", err)
	}

	return nil
}

func MigrateDown() error {
	dsn := "host=localhost user=client-user password=client-password dbname=client port=5434 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	err = db.Migrator().DropTable(&client.Client{}, &ticket.Ticket{})
	if err != nil {
		return fmt.Errorf("failed to drop database tables: %v", err)
	}

	return nil
}

func EnsureUUIDExtension(db *gorm.DB) {
	err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error
	if err != nil {
		log.Fatalf("Failed to create 'uuid-ossp' extension: %v", err)
	}
	log.Println("Successfully ensured 'uuid-ossp' extension is created")
}
