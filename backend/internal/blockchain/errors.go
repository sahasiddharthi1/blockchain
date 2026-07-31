package blockchain

import "errors"

// Sentinel errors for this package. Defined once, compared with
// errors.Is at call sites — never string-matched. This is the local
// (package-internal) equivalent of pkg/errors' typed AppError; callers in
// the mining/API layer translate these into an *errors.AppError with the
// right Kind at the boundary where they turn into an HTTP/WS response.
var (
	ErrProofOfWorkExhausted = errors.New("blockchain: exhausted nonce space without meeting difficulty target")
	ErrEmptyChain           = errors.New("blockchain: chain has no blocks")
	ErrInvalidGenesis       = errors.New("blockchain: genesis block is invalid")
	ErrPrevHashMismatch     = errors.New("blockchain: block's prev_hash does not match previous block's hash")
	ErrHashInvalid          = errors.New("blockchain: block hash does not match recalculated hash or fails difficulty target")
	ErrIndexOutOfOrder      = errors.New("blockchain: block index is not sequential")
	ErrBlockNotFound        = errors.New("blockchain: block not found")
)
