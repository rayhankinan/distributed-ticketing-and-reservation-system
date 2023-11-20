PWD = $(shell pwd)

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

run: 
	go run ./main.go start

migrate-up: 
	go run ./main.go migrateUp