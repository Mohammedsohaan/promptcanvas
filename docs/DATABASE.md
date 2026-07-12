# Database Design

Document the initial database structure for PromptCanvas Version 1.

---

## Users

Store:

- User ID
- Full Name
- Email
- Password (hashed)
- Created At

---

## Products

Each product belongs to one user.

Store:

- Product ID
- User ID
- Product Name
- Short Description
- Problem Statement
- Target Users
- Goals
- Core Features
- MVP
- Notes
- Created At
- Updated At

---

## Relationship

One User → Many Products

Each Product belongs to exactly one User.

---

## Notes

This document is only for planning the database.

Do not generate SQL.

Do not create migrations.

Do not create Prisma or Supabase schemas.

Do not modify any existing project files.
