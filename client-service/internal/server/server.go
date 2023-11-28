package server

import (
	"context"
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
)

// generate mock using:
// $ cd server/
// $ mockery --name=Server
type Server interface {
	Start() error
	Stop(ctx context.Context) error
	Echo() *echo.Echo
}

type server struct {
	logger *logrus.Logger
	echo   *echo.Echo
}

func New(l *logrus.Logger) Server {
	e := echo.New()
	e.Logger.SetOutput(l.Writer())

	e.Use(middleware.CORS())
	e.Use(middleware.Recover())

	return &server{
		logger: l,
		echo:   e,
	}
}

func (s *server) Start() error {
	conn := fmt.Sprintf(":%s", "8080")
	return s.echo.Start(conn)
}

func (s *server) Stop(ctx context.Context) error {
	return s.echo.Shutdown(ctx)
}

func (s *server) Echo() *echo.Echo {
	return s.echo
}

func (s *server) Logger() *logrus.Logger {
	return s.logger
}
