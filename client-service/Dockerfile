# syntax=docker/dockerfile:1

FROM golang:latest

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /client-service

EXPOSE 3001

# Run
CMD ["/client-service", "start"]
