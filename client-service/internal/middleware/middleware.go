package middleware

import (
	"net/http"
	"strings"

	"client-service/internal/jwt"

	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type Middleware struct {
	Logger *logrus.Logger
}

func NewMiddleware(logger *logrus.Logger) Middleware {
	return Middleware{Logger: logger}
}

func (m *Middleware) RoleCheckMiddleware(allowedRoles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			jwtToken := c.Request().Header.Get("Authorization")
			tokenString := strings.Replace(jwtToken, "Bearer ", "", 1)

			userRole, err := jwt.GetRoleFromJWT(tokenString)
			if err != nil {
				m.Logger.Warn("Access denied for role:", userRole)
				return echo.NewHTTPError(http.StatusForbidden, "Access denied")
			}

			if !isAllowedRole(userRole, allowedRoles) {
				m.Logger.Warn("Access denied for role:", userRole)
				return echo.NewHTTPError(http.StatusForbidden, "Access denied")
			}

			return next(c)
		}
	}
}

func isAllowedRole(userRole string, allowedRoles []string) bool {
	for _, role := range allowedRoles {
		if userRole == role {
			return true
		}
	}
	return false
}
