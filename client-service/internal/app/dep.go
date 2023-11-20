package app

import (
	"fmt"
	"runtime"
	"strings"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
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

func NewDatabaseConn() (*gorm.DB, error) {
	dsn := "host=client-database user=client-user password=client-password dbname=client port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}
