package app

import (
	"context"
	"time"
)

func (a *App) StartBackgroundJobs(ctx context.Context) {
	ticker := time.NewTicker(24 * time.Hour)

	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				_ = a.Handler.Service.CleanupExpiredSessions(ctx)
			}
		}
	}()
}
