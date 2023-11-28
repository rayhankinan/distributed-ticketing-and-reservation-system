package client

import "client-service/internal/server"

func RegisterRoute(s server.Server, h Handle) {
	v1 := s.Echo().Group("/v1")
	v1.POST("/client", h.CreateUserHandler)
	v1.GET("/client/:id", h.GetUserHandler)
	v1.PATCH("/client/:id", h.UpdateUserHandler)
	v1.DELETE("/client/:id", h.DeleteUserHandler)
	v1.POST("/client/login", h.LoginHandler)
}
