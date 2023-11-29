package ticket

import (
	"client-service/internal/middleware"
	"client-service/internal/server"
)

func RegisterRoute(s server.Server, h Handle, mw middleware.Middleware) {
	v1 := s.Echo().Group("/v1")
	userGroup := v1.Group("", mw.RoleCheckMiddleware("USER"))

	userGroup.POST("/ticket", h.CreateTicketHandler)
	userGroup.GET("/ticket", h.GetTicketHandler)
	userGroup.PUT("/ticket/:id", h.UpdateTicketHandler)
	userGroup.DELETE("/ticket/:id", h.DeleteTicketHandler)
	userGroup.POST("/ticket/:id/refund", h.RefundTicketHandler)
	userGroup.PATCH("/ticket/webhook", h.UpdateTicketByUserIDHandler)
}
