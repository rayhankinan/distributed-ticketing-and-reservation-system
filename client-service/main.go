package main

import (
	"client-service/internal/app"
)

func main() {
	dep := app.NewDep()
	app := app.NewStartCmd(dep)
	app.Start()
}
