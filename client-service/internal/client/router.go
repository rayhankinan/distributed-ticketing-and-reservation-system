package client

import "client-service/internal/server"

func RegisterRoute(s server.Server, h Handle) {
	v1 := s.Echo().Group("/v1")
	v1.POST("/client/login", h.LoginHandler)
	v1.POST("/client", h.CreateUserHandler)
	v1.GET("/client", h.GetUserHandler)
	v1.PUT("/client/:id", h.UpdateUserHandler)
	v1.DELETE("/client/:id", h.DeleteUserHandler)
}

// OPTIONAL: Tambahkan middleware untuk validasi admin pada route tertentu
// OPTIONAL: Tambahkan middleware untuk validasi user pada route tertentu
