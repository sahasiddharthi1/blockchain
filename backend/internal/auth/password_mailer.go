// mailer.go delivers transactional email (today: password-reset links).
//
// Two transport modes, chosen at construction:
//   - SMTP: when the SMTP host is configured (see internal/config for the
//     env vars). Supports implicit TLS (port 465) and STARTTLS (587).
//   - Dev log: when no host is set, the reset link is written through a
//     zap-Sugar-compatible logf callback instead of being sent. This keeps
//     the whole forgot/reset flow exercisable end-to-end locally with zero
//     external dependencies — the link shown in the logs is the link the
//     frontend's reset page consumes.
package auth

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"time"
)

// MailOptions configures the mailer. Host empty selects the dev-log mode.
type MailOptions struct {
	From     string // envelope From / From header
	Host     string // SMTP host; "" enables dev-log transport
	Port     int    // 465 = implicit TLS, 587/25 = STARTTLS
	User     string
	Pass     string
	Insecure bool // skip TLS certificate verification (dev only)
}

// Mailer sends transactional mail to a single recipient (password resets).
type Mailer struct {
	opts MailOptions
	logf func(msg string, keysAndValues ...interface{})
}

// NewMailer builds a Mailer. logf must tolerate (msg, KV...) args and is
// used for the dev-log transport; it may be nil, in which case dev-log
// links are simply dropped.
func NewMailer(opts MailOptions, logf func(msg string, keysAndValues ...interface{})) *Mailer {
	return &Mailer{opts: opts, logf: logf}
}

// SendPasswordResetLink delivers a password-reset link to the account email.
func (m *Mailer) SendPasswordResetLink(to, link string) error {
	if m.opts.Host == "" {
		if m.logf != nil {
			m.logf("dev transport: password reset link (no SMTP configured, link logged)",
				"to", to, "link", link)
		}
		return nil
	}

	body := "We received a request to reset your Ledgerforge password.\n\n" +
		"Click the link below to choose a new password. It's a one-time link " +
		"that expires after a short time:\n\n" + link + "\n\n" +
		"If you didn't request this, you can safely ignore this email — your " +
		"password won't change unless you use the link above."

	return m.send(to, "Reset your Ledgerforge password", "Ledgerforge <"+m.opts.From+">", body)
}

func (m *Mailer) send(to, subject, fromHeader, body string) error {
	addr := fmt.Sprintf("%s:%d", m.opts.Host, m.opts.Port)
	tlsCfg := &tls.Config{ServerName: m.opts.Host, InsecureSkipVerify: m.opts.Insecure}

	var client *smtp.Client
	var err error

	if m.opts.Port == 465 {
		// Implicit TLS (SMTPS).
		conn, derr := tls.Dial("tcp", addr, tlsCfg)
		if derr != nil {
			return fmt.Errorf("auth: dial smtp(tls): %w", derr)
		}
		client, err = smtp.NewClient(conn, m.opts.Host)
		if err != nil {
			conn.Close()
			return fmt.Errorf("auth: smtp client: %w", err)
		}
	} else {
		client, err = smtp.Dial(addr)
		if err != nil {
			return fmt.Errorf("auth: smtp dial: %w", err)
		}
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(tlsCfg); err != nil {
				client.Close()
				return fmt.Errorf("auth: smtp starttls: %w", err)
			}
		}
	}
	defer client.Close()

	if m.opts.User != "" {
		if err := client.Auth(smtp.PlainAuth("", m.opts.User, m.opts.Pass, m.opts.Host)); err != nil {
			return fmt.Errorf("auth: smtp auth: %w", err)
		}
	}

	if err := client.Mail(m.opts.From); err != nil {
		return fmt.Errorf("auth: smtp mail: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("auth: smtp rcpt: %w", err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("auth: smtp data: %w", err)
	}
if _, err := fmt.Fprintf(w,
			"From: %s\r\nTo: <%s>\r\nSubject: %s\r\nMIME-Version: 1.0\r\n"+
				"Content-Type: text/plain; charset=\"utf-8\"\r\n"+
				"Date: %s\r\n\r\n%s",
			fromHeader, to, subject,
			time.Now().Format(time.RFC1123Z), body); err != nil {
		w.Close()
		return fmt.Errorf("auth: smtp write: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("auth: smtp close data: %w", err)
	}
	return client.Quit()
}