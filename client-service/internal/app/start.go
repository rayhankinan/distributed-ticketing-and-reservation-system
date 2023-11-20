package app

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"time"

	"client-service/internal/handler"
	"client-service/internal/router"
	"client-service/internal/server"

	"github.com/sirupsen/logrus"
)

type StartCmd struct {
	Server   server.Server
	Logger   *logrus.Logger
	QuitChan chan os.Signal
}

func NewStartCmd(dep *Dep) *StartCmd {
	s := server.New(dep.Logger)
	// _, err := NewDatabaseConn()
	// if err != nil {
	// 	dep.Logger.Fatalf("failed to connect to database: %v", err)
	// }

	h := handler.New()
	router.Register(s, h)
	quitChan := make(chan os.Signal, 1)

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
