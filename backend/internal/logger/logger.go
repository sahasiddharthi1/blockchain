// Package logger provides a single, structured, application-wide logger
// built on zap.
//
// Why zap instead of the standard library log package:
//   Standard `log` only writes unstructured text. In production you need
//   structured (JSON) logs so they can be shipped to and queried in a log
//   aggregator (Loki, Datadog, CloudWatch) — e.g. filtering every log line
//   where block_height=5000 or wallet_id="...". zap does this with very
//   low allocation overhead, which matters on a hot path like mining or
//   transaction validation where you may log per block/tx.
package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// New builds a zap.Logger configured for the given environment.
// "production" emits JSON on a single line (machine-parseable);
// anything else emits a human-readable console format for local dev.
func New(env string) (*zap.Logger, error) {
	var cfg zap.Config
	if env == "production" {
		cfg = zap.NewProductionConfig()
		cfg.EncoderConfig.TimeKey = "ts"
		cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	} else {
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}
	return cfg.Build()
}
