package main

import (
	"client-service/internal/app"
	"client-service/internal/cmd"
)

func main() {
	dep := app.NewDep()
	cli := cmd.New(dep)
	_ = cli.Execute()
}
