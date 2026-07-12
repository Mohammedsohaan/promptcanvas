# Environment Variables

Document the environment variables that will be required.

---

## Database

`DATABASE_URL`

Description:
Connection string for the PostgreSQL database.

---

## Supabase

`NEXT_PUBLIC_SUPABASE_URL`

Description:
Public URL of the Supabase project.

`NEXT_PUBLIC_SUPABASE_ANON_KEY`

Description:
Public anonymous key used by the frontend.

`SUPABASE_SERVICE_ROLE_KEY`

Description:
Private service role key used only on the server.

---

## Authentication

`NEXTAUTH_SECRET`

Description:
Secret used for secure authentication sessions.

---

## Application

`NEXT_PUBLIC_APP_URL`

Description:
Base URL of the application.

---

## Notes

- Never commit .env files to GitHub.
- Never expose private keys.
- Store secrets only in environment variables.
