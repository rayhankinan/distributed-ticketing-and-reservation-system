package ticket

import "client-service/internal/server"

// TODO: Tambahkan request untuk refund ticket
func RegisterRoute(s server.Server, h Handle) {
	v1 := s.Echo().Group("/v1")
	v1.POST("/ticket", h.CreateTicketHandler)
	v1.GET("/ticket", h.GetTicketHandler)
	v1.PUT("/ticket/:id", h.UpdateTicketHandler)
	v1.DELETE("/ticket/:id", h.DeleteTicketHandler)
	v1.POST("/ticket/:id/refund", h.RefundTicketHandler)
	v1.PATCH("/ticket/webhook", h.UpdateTicketByUserIDHandler)
}

// OPTIONAL: Tambahkan middleware untuk validasi admin pada route tertentu
// OPTIONAL: Tambahkan middleware untuk validasi user pada route tertentu
