package router

import (
	"client-service/internal/handler"
	"client-service/internal/server"
)

func Register(s server.Server, h handler.Handle) {
	s.Echo().GET("/ping", h.PingHandler)
}
