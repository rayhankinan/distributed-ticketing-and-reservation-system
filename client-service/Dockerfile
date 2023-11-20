# syntax=docker/dockerfile:1

# Build stage
FROM golang:latest as builder

WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o client-service

# Final stage
FROM alpine:latest

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/client-service .

EXPOSE 3001

# Run the application
CMD ["./client-service", "start"]
