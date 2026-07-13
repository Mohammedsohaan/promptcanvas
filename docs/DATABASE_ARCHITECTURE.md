# PromptCanvas Database Architecture

This document defines the Version 1 database architecture for PromptCanvas. It serves as the definitive structural blueprint for the future implementation of our persistent storage layer.

## Philosophy

Version 1 intentionally restricts the database footprint to the absolute minimum necessary to support core functionality. The primary goals of this philosophy are:

- **Easy to Maintain:** Fewer tables drastically reduce operational overhead, migration complexity, and cognitive load for the engineering team.
- **Scalable:** A flat, simple schema prevents expensive cross-table joins during high-traffic reads.
- **Normalized:** Core entities are cleanly separated without premature optimization.
- **Secure:** A reduced surface area simplifies the implementation of strict access policies.
- **Production-Ready:** Building a bulletproof foundation guarantees stability before introducing complex relational features.

## Planned Tables

To adhere strictly to the Version 1 philosophy, the schema relies exclusively on two primary tables. No unnecessary tables will be created.

- `Users`
- `Products`

## Users Table

The `Users` table manages the core identity of individuals accessing the platform. Authentication secrets are handled externally by the auth provider; this table stores application-specific identity data.

- **id:** `UUID`. The primary key, mirroring the authentication provider's user ID for strict 1:1 mapping.
- **email:** `String`. The user's primary contact address. Must be unique and heavily indexed for rapid lookups.
- **full_name:** `String`. The user's display name, utilized across the UI for personalization.
- **avatar_url:** `String`. An optional remote URL pointing to the user's profile image.
- **created_at:** `Timestamp`. Automatically recorded upon record insertion.
- **updated_at:** `Timestamp`. Automatically updated on any record modification.

## Products Table

The `Products` table is the central nervous system of the application. In Version 1, it consolidates product metadata, wizard state, and the final generated output to avoid unnecessary relational complexity.

- **id:** `UUID`. The primary key for the product.
- **owner_id:** `UUID`. A foreign key referencing `Users.id`, defining strict ownership.
- **name:** `String`. The working title of the product.
- **description:** `Text`. A high-level executive summary of the software.
- **problem:** `Text`. The specific pain point the software addresses.
- **target_users:** `Text`. The defined audience and primary personas.
- **goals:** `Text`. Business and technical objectives dictating product success.
- **status:** `Enum`. The lifecycle stage of the product (`Draft`, `Planning`, `Completed`, `Archived`).
- **current_step:** `String`. Tracks the user's active position within the Product Wizard.
- **completed_steps:** `JSONB` or `Array`. An array tracking which wizard stages have been validated.
- **blueprint:** `JSONB`. A structured JSON document containing the compiled architectural specification (Features, MVP, Success Metrics, etc.). Storing this as JSONB allows flexible iteration of the blueprint format without requiring constant schema migrations.
- **created_at:** `Timestamp`. Automatically recorded upon record insertion.
- **updated_at:** `Timestamp`. Automatically updated on any record modification.

## Relationships

The Version 1 database structure enforces a strictly hierarchical, single-direction relationship:

**One User**  
↓  
**Many Products**  

Products belong to exactly one user. Shared ownership is explicitly unsupported in this iteration.

## Future Tables

To maintain velocity and system stability, several concepts have been intentionally postponed until Version 2 or later. These tables are excluded from Version 1:

- **Teams:** Supporting organizational structures and shared billing.
- **Invitations:** Managing secure onboarding of external members to a workspace.
- **Comments:** Enabling line-level discussion on blueprints.
- **Notifications:** In-app and email alerts for collaborative events.
- **Activity Logs:** Audit trails for enterprise compliance and history tracking.
- **AI Sessions:** Chat history and context tracking for AI-assisted blueprint generation.
- **Templates:** Pre-configured starting points for common software architectures.

**Exclusion Rationale:** Implementing these features now would introduce premature multi-tenant complexity, requiring deep relational logic that distracts from the core mission: perfecting the single-player planning experience.

## Security Philosophy

Security is uncompromising. Every user must only be able to query, view, and mutate their own products. 

This will be strictly enforced at the database level using **Row Level Security (RLS)**. Even if an application vulnerability exists, the database engine will reject any query attempting to read or write a `Products` record where the `owner_id` does not match the authenticated user's session token.

## Scalability

This architecture is designed to scale organically:

1. **Horizontal Scaling:** Because `Products` are strictly partitioned by `owner_id`, the database is inherently suitable for future sharding by user or tenant if required.
2. **Schema Flexibility:** By utilizing `JSONB` for `completed_steps` and `blueprint`, we can rapidly iterate on the wizard structure and blueprint outputs without executing locking schema migrations in production.
3. **Non-Breaking Migrations:** When `Teams` or `Comments` are introduced in Version 2, they will simply reference the existing `Products` table via foreign keys. The foundational Version 1 schema will not require breaking modifications to support future expansion.
