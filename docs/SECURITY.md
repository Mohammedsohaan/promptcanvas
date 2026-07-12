# Security

Document the security practices for PromptCanvas.

---

## Authentication

- Every user must log in before accessing protected pages.
- Protected routes should not be accessible without authentication.
- Sessions should be securely managed.

---

## Passwords

- Never store plain text passwords.
- Passwords must always be hashed by the authentication provider.

---

## Database

- Every product belongs to exactly one user.
- Users must never access another user's products.

---

## Environment Variables

- Never commit .env files.
- Never expose secret keys.
- Store secrets only in environment variables.

---

## API

- Validate all incoming requests.
- Return appropriate error messages.
- Never expose internal server information.

---

## General

- Validate user input.
- Prevent unauthorized access.
- Keep dependencies updated.

---

## Notes

This document is for planning only.
