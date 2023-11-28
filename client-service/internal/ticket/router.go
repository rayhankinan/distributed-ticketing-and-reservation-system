package ticket

import "client-service/internal/server"

func RegisterRoute(s server.Server, h Handle) {
	v1 := s.Echo().Group("/v1")
	v1.POST("/ticket", h.CreateTicketHandler)
	v1.GET("/ticket/:id", h.GetTicketHandler)
	v1.PATCH("/ticket/:id", h.UpdateTicketHandler)
	v1.DELETE("/ticket/:id", h.DeleteTicketHandler)
	v1.PATCH("/ticket/webhook", h.UpdateTicketByUserIDHandler)
}
