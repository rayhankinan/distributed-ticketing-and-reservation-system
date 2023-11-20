package cmd

import (
	"client-service/internal/app"
	"client-service/migrations"

	"github.com/spf13/cobra"
)

func New(dep *app.Dep) *cobra.Command {
	cli := &cobra.Command{}

	cli.AddCommand(&cobra.Command{
		Use:   "start",
		Short: "Starting server",
		Long:  `Starting server`,
		Run: func(c *cobra.Command, _ []string) {
			startCmd := app.NewStartCmd(dep)
			startCmd.Start()
		},
	})

	cli.AddCommand(&cobra.Command{
		Use:   "migrateUp",
		Short: "Run database migrations",
		Long:  `Run database migrations`,
		Run: func(c *cobra.Command, _ []string) {
			err := migrations.MigrateUp()
			if err != nil {
				dep.Logger.Fatalf("Migration failed: %v", err)
			}
			dep.Logger.Println("Migrations completed successfully")
		},
	})

	return cli
}
