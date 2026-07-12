# API Design

Document the API endpoints for PromptCanvas Version 1.

---

## Authentication

- `POST /register`: Create a new user account.
- `POST /login`: Authenticate an existing user.
- `POST /logout`: End the current user session.

---

## Products

- `GET /products`: Return all products for the logged-in user.
- `GET /products/:id`: Return a single product.
- `POST /products`: Create a new product.
- `PUT /products/:id`: Update an existing product.
- `DELETE /products/:id`: Delete a product.

---

## Product Wizard

- `POST /wizard/generate`: Generate a Product Blueprint from the completed Product Wizard.

---

## Notes

This document is for planning only.

Do not generate backend code.

Do not generate SQL.

Do not create Express routes.

Do not create Next.js API routes.
