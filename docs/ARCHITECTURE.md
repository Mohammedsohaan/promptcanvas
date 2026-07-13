# PromptCanvas Architecture

This document serves as the technical blueprint for PromptCanvas. It outlines the structural decisions, routing architecture, component philosophy, and long-term scaling strategy.

## High Level Overview

PromptCanvas is structurally divided into six distinct domains, ensuring clear boundaries of responsibility:

- **Landing Website:** An unauthenticated, marketing-facing environment responsible for communicating value and driving conversions. Optimized for SEO and performance.
- **Authentication:** A secure perimeter handling user registration, login, and session persistence.
- **Dashboard:** The central authenticated hub where users can view, search, and manage their product repository.
- **Product Wizard:** A guided, step-by-step sequential data collection workflow used to capture structured product ideas.
- **Product Workspace:** A unified, persistent environment where a single product idea is stored, visualized, and edited.
- **Blueprint Generator:** The intelligent orchestration layer responsible for compiling wizard inputs into structured architectural blueprints.

---

## Frontend Architecture

We utilize the Next.js App Router paradigm, strictly separating routing from business logic and UI presentation.

- `app/`: Exclusively reserved for file-based routing, route layouts, and page-level entry points.
- `components/`: Contains all React components, structurally grouped by domain (e.g., `auth/`, `dashboard/`, `wizard/`, `shared/`).
- `hooks/`: Custom React hooks encapsulating reusable component-level logic and state lifecycle management.
- `lib/`: Core infrastructural utilities, third-party integrations (like Supabase clients), schemas, and environment-agnostic helper functions.
- `services/`: Business logic operations, API abstractions, and external system interactions (e.g., database queries, third-party APIs).
- `types/`: Global TypeScript interfaces and type definitions defining our data contracts.

---

## Component Philosophy

Components are categorized by their responsibility to prevent tight coupling and maintain reusability.

- **Shared UI:** Highly reusable, strictly dumb components (buttons, inputs, dialogs) located in `components/shared/` or `components/ui/`. These have no external dependencies or business logic.
- **Feature Components:** Domain-specific components (e.g., `WizardStepOne`, `ProductCard`). They may contain local business logic and rely on hooks, but remain isolated to their specific feature area.
- **Layout Components:** Purely structural components responsible for navigation bars, sidebars, and grid wrappers. They handle spatial organization but not content.
- **Page Components:** The top-level assemblies located in `app/`. Their sole responsibility is to fetch necessary server data and compose Layouts and Feature Components together.

---

## Routing Architecture

Our routing structure is flat, semantic, and highly predictable. 

- `/`
  **Landing Page.** Unauthenticated public entry point.
- `/login`
  **Authentication.** Entry point for returning users.
- `/signup`
  **Authentication.** Entry point for new users.
- `/dashboard`
  **Protected.** The user's primary post-login hub, summarizing active projects and recent activity.
- `/products`
  **Protected.** A paginated or filterable list view of all products owned by the user.
- `/products/new`
  **Protected.** Initializes a new product and enters the Product Wizard flow.
- `/products/[id]`
  **Protected.** The isolated Product Workspace for viewing and editing a specific generated blueprint.
- `/settings`
  **Protected.** User account management, billing, and application preferences.

---

## State Management

PromptCanvas favors a decentralized, minimal-overhead state management philosophy to avoid overengineering.

- **Local Component State:** Managed via standard React `useState` and `useReducer`. Used exclusively for transient UI states (toggles, form inputs, open/closed menus).
- **Server State:** Managed through React Server Components where possible, and client-side data-fetching libraries (e.g., SWR, React Query) when client-side mutation is required. Global stores (like Redux or Zustand) are intentionally avoided until deeply nested state propagation becomes a demonstrable bottleneck.
- **Authentication State:** Persisted securely via Supabase session management, accessed through deeply scoped context providers wrapping protected routes.

---

## Authentication Flow

Authentication is delegated to Supabase, following a strictly enforced sequence:

1. **Sign Up:** User submits credentials.
2. **Email Verification:** User verifies ownership of their address.
3. **Login:** Exchange of credentials for session tokens.
4. **Session:** Secure JWT stored and validated via Next.js middleware on protected routes.
5. **Protected Dashboard:** User accesses application functionality.
6. **Logout:** Secure destruction of session tokens and redirection to the public landing page.

---

## Product Flow

The lifecycle of a product within PromptCanvas is heavily structured to ensure data integrity:

1. **Create Product:** Triggered from `/products/new`.
2. **Wizard:** A multi-stage sequential funnel collecting specific structural requirements.
3. **Blueprint:** The system compiles the inputs and generates the architectural specification.
4. **Save:** The blueprint is committed to the database.
5. **Edit:** The user revisits the workspace (`/products/[id]`) to refine the architecture.
6. **Archive:** Products are soft-deleted or archived when no longer actively managed.

---

## Folder Responsibilities

At the root level, folders maintain strict separation of concerns:

- `/app`: The routing layer. Nothing lives here except standard Next.js route files.
- `/components`: The visual layer.
- `/docs`: Project documentation, architectural decisions, and brand guidelines.
- `/lib`: The infrastructure layer.
- `/hooks`: The component-logic layer.
- `/services`: The business logic layer.
- `/types`: The data contract layer.

---

## Coding Standards

To ensure long-term maintainability across a growing engineering team, the following standards are enforced:

- **Naming Conventions:** Directories and files use `kebab-case`. React components use `PascalCase`. Utility functions and variables use `camelCase`.
- **Component Size:** Components must remain small and focused. If a component exceeds 200 lines, it must be evaluated for extraction into smaller sub-components.
- **Reusable Code:** Any logic repeated more than twice must be extracted into a hook or a utility function in `/lib`.
- **TypeScript Usage:** Strictly typed. The use of `any` is forbidden. External API boundaries must be explicitly typed using interfaces in the `/types` directory.
- **Documentation Philosophy:** Code should be self-documenting through precise naming. Comments are reserved exclusively for explaining "why" a complex decision was made, never "what" the code is doing.

---

## Scalability

PromptCanvas is designed as Version 1, but built to accommodate scale.

By isolating business logic (`/services`), strict data typing (`/types`), and presentation (`/components`), we can easily integrate complex backend architectures, swap databases, or introduce expansive new feature sets (such as AI generation or team collaboration) without requiring fundamental rewrites of the frontend structure. App Router's native code splitting and server-rendering ensure the client bundle remains exceptionally small, regardless of future application depth.
