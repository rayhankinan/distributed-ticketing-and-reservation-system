package app

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"time"

	"client-service/internal/client"
	"client-service/internal/handler"
	"client-service/internal/middleware"
	"client-service/internal/router"
	"client-service/internal/server"
	"client-service/internal/ticket"

	"github.com/sirupsen/logrus"
)

type StartCmd struct {
	Server   server.Server
	Logger   *logrus.Logger
	QuitChan chan os.Signal
}

func NewStartCmd(dep *Dep) *StartCmd {
	s := server.New(dep.Logger)
	db, err := NewDatabaseConn()
	if err != nil {
		dep.Logger.Fatalf("failed to connect to database: %v", err)
	}

	h := handler.New()
	router.Register(s, h)
	quitChan := make(chan os.Signal, 1)
	middleware := middleware.NewMiddleware(dep.Logger)

	clientRepo := client.NewRepository(db)
	clientUsecase := client.NewUsecase(clientRepo)
	clientHandler := client.NewHandle(clientUsecase, dep.Logger)
	client.RegisterRoute(s, clientHandler)

	ticketRepo := ticket.NewRepository(db)
	ticketUsecase := ticket.NewUsecase(ticketRepo)
	ticketHandler := ticket.NewHandle(ticketUsecase, dep.Logger)
	ticket.RegisterRoute(s, ticketHandler, middleware)

	return &StartCmd{
		Server:   s,
		Logger:   dep.Logger,
		QuitChan: quitChan,
	}
}

func (c *StartCmd) Start() {
	go func() {
		if err := c.Server.Start(); err != nil && errors.Is(err, http.ErrServerClosed) {
			c.Logger.Fatal("shutting down the server", err)
		}
	}()

	signal.Notify(c.QuitChan, os.Interrupt)
	<-c.QuitChan

	c.Logger.Info("attempting graceful shutdown")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := c.Server.Stop(ctx); err != nil {
		c.Logger.Fatal(err)
	}
	c.Logger.Info("graceful shutdown completed")
}
