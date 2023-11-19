package app

import (
	"fmt"
	"runtime"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type Dep struct {
	Logger *logrus.Logger
}

func NewDep() *Dep {
	l := logrus.New()
	l.SetReportCaller(true)
	l.SetFormatter(&logrus.TextFormatter{
		CallerPrettyfier: func(frame *runtime.Frame) (function string, file string) {
			_, after, _ := strings.Cut(frame.File, "client-service/")
			fileName := fmt.Sprintf("%s:%d", after, frame.Line)

			s := strings.Split(frame.Function, ".")
			funcname := s[len(s)-1]

			return funcname, fileName
		},
	})
	l.SetLevel(logrus.DebugLevel)
	return &Dep{
		Logger: l,
	}
}

func NewDatabaseConn() (*sqlx.DB, error) {
	user := "client-user"
	password := "client-password"
	host := "client-database.docker-compose"
	port := "5432"
	dbname := "client"
	sslmode := "disable"

	connURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbname, sslmode)
	return sqlx.Connect("postgres", connURL)
}
