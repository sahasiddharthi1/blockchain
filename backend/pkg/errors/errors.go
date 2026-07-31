// Package errors defines a small set of typed application errors so that
// HTTP handlers (and any other transport, e.g. WebSocket) can map internal
// failures to the right response without string-matching error messages.
//
// Why not just use fmt.Errorf everywhere:
//   String-matching error text ("if strings.Contains(err.Error(), "not
//   found")") is brittle — it breaks the moment someone rewords a message.
//   Wrapping errors in a typed *AppError with a Kind lets any layer (HTTP,
//   WebSocket, gRPC later) do a type switch and pick the right status code,
//   while errors.Is/errors.As still work because AppError implements Unwrap.
package errors

import "fmt"

// Kind classifies an error for transport-layer mapping (e.g. HTTP status).
type Kind string

const (
	KindNotFound     Kind = "NOT_FOUND"
	KindInvalidInput Kind = "INVALID_INPUT"
	KindUnauthorized Kind = "UNAUTHORIZED"
	KindConflict     Kind = "CONFLICT"
	KindInternal     Kind = "INTERNAL"
)

// AppError is the typed error every internal package should return for
// anything that might surface to a caller (as opposed to a purely internal
// bug, which should still just be a plain Go error / panic in a bad state).
type AppError struct {
	Kind    Kind
	Message string
	Err     error // wrapped underlying error, may be nil
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s: %v", e.Kind, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Kind, e.Message)
}

func (e *AppError) Unwrap() error { return e.Err }

func NotFound(msg string, err error) *AppError {
	return &AppError{Kind: KindNotFound, Message: msg, Err: err}
}

func InvalidInput(msg string, err error) *AppError {
	return &AppError{Kind: KindInvalidInput, Message: msg, Err: err}
}

func Unauthorized(msg string, err error) *AppError {
	return &AppError{Kind: KindUnauthorized, Message: msg, Err: err}
}

func Conflict(msg string, err error) *AppError {
	return &AppError{Kind: KindConflict, Message: msg, Err: err}
}

func Internal(msg string, err error) *AppError {
	return &AppError{Kind: KindInternal, Message: msg, Err: err}
}
