# PromptCanvas Authentication Architecture

This document defines the complete authentication architecture for PromptCanvas Version 1.

## Objective

Build a secure authentication system using Supabase Authentication that allows users to securely create accounts, sign in, access their own workspace, and sign out. Authentication must remain simple, secure, and production-ready from day one.

## Authentication Provider

**Provider:** Supabase Authentication

Supabase was explicitly chosen for Version 1 due to the following architectural benefits:

- **Security First:** Built on proven, enterprise-grade security standards (GoTrue).
- **PostgreSQL Integration:** Native integration with our PostgreSQL database, ensuring authentication identity maps flawlessly to our data model.
- **Row Level Security (RLS):** Supabase seamlessly injects the user's UUID into database transactions, allowing PostgreSQL to enforce data access policies at the query engine level.
- **JWT Sessions:** Stateless, secure JSON Web Tokens handle session persistence automatically.
- **Easy Integration with Next.js:** Supabase provides official, robust server-side rendering (SSR) and App Router support, critical for protecting server components.

## Authentication Flow

The standard user lifecycle follows a strict sequence:

1. **Landing Page:** Public entry point.
2. **Sign Up:** User initiates account creation.
3. **Email Verification:** (Optional for Version 1) Verification link sent to the user's inbox to confirm identity.
4. **Login:** Exchange of credentials for session tokens.
5. **Authenticated Session:** Secure JWT is stored and validated.
6. **Dashboard:** User enters the protected application.
7. **Logout:** Session tokens are securely destroyed.
8. **Landing Page:** User is redirected to the public root.

## User Registration

To create an account, the following fields are required:

- **Email:** Must be a valid format. Checked for uniqueness.
- **Password:** Must meet security complexity requirements (minimum 8 characters).
- **Full Name:** Required for application personalization. Must not be empty.

## User Login

The login process requires:

- **Email:** The registered email address.
- **Password:** The associated secret.

Upon successful validation, Supabase issues a session payload containing access and refresh tokens. The application then immediately redirects the user to the `/dashboard`.

## Protected Routes

Any attempt to access the following routes without a valid JWT session will be intercepted by Next.js middleware and redirected to `/login`:

- `/dashboard`
- `/products`
- `/products/new`
- `/products/[id]`

## Public Routes

The following routes are explicitly exempt from authentication requirements:

- `/` (Landing Page)
- `/login`
- `/signup`

## Session Management

Authentication state is maintained utilizing Supabase's built-in session handlers.

- **JWT Session:** The primary source of truth for user identity during a request.
- **Persistent Login:** Tokens are securely stored via HTTP-only cookies in Next.js to maintain sessions securely across browser restarts.
- **Session Refresh:** Supabase client libraries automatically handle exchanging expiring access tokens for new ones using the securely stored refresh token.
- **Logout:** Explicitly calling the logout method destroys the local session cookies and invalidates the server-side session.

## Error Handling

The authentication UI must gracefully handle and explicitly surface the following expected errors:

- **Invalid email:** The provided email address is not formatted correctly.
- **Wrong password:** The credentials do not match any active account.
- **Email already exists:** The user is attempting to register an address that is already in use.
- **Weak password:** The provided password fails security complexity requirements.
- **Expired session:** The user's refresh token has expired, requiring them to log in again.
- **Network failure:** The client cannot reach the authentication provider.

## Security Principles

The authentication architecture is governed by the following unyielding principles:

- **Never expose secrets:** Private keys and service role keys must never be bundled into the client application.
- **Never trust client-side authorization:** UI state (e.g., hiding a button) is a UX convenience, not security. Real authorization must occur on the server and at the database level.
- **Always validate ownership:** Before mutating any product data, verify the product belongs to the currently authenticated user session.
- **Always use HTTPS:** Enforce encrypted transport across all environments.
- **Store secrets only in environment variables:** Use `.env.local` for development and secure secret managers in production.

## Version 1 Scope

To ensure rapid, secure delivery, Version 1 scope is strictly constrained.

**Version 1 explicitly includes:**
- Email/password authentication
- Sign Up
- Login
- Logout
- Protected routes

**Version 1 explicitly excludes:**
- Google Login (OAuth)
- GitHub Login (OAuth)
- Magic Links
- Two-Factor Authentication (2FA)
- Passwordless Login
