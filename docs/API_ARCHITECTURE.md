# PromptCanvas API Architecture

This document defines the API architecture for PromptCanvas Version 1. It serves as the planning foundation for all future backend route implementations.

## Philosophy

PromptCanvas should expose only the minimum API surface required to support Version 1 functionality. Every endpoint must be strictly necessary. The overarching philosophy guarantees the API remains:

- **RESTful:** Leveraging standard HTTP verbs and predictable resource-based URLs.
- **Predictable:** Exhibiting uniform behavior, standard response envelopes, and consistent error handling across all routes.
- **Secure:** Validating identity and ownership on every single request.
- **Scalable:** Avoiding heavy server-side aggregations in favor of simple, targeted data retrieval.
- **Easy to Maintain:** Preventing endpoint sprawl and minimizing complex routing logic.

## Version 1 Endpoints

### Authentication

Authentication is handled entirely by Supabase via their managed infrastructure and client libraries.

**There are NO custom authentication endpoints.**

Attempting to reinvent login flows introduces unnecessary security risks and maintenance burdens. All token issuance, refresh cycles, and session validations are delegated securely.

### Products

The core entity managed by the API is the Product.

- **`GET /products`**
  Retrieves a paginated or filtered list of products owned by the authenticated user. Excludes heavy payload fields (like the compiled blueprint) to ensure rapid dashboard loading.

- **`GET /products/:id`**
  Retrieves the complete data payload for a specific product, including wizard state and the generated blueprint. Used to populate the Product Workspace.

- **`POST /products`**
  Initializes a new product. Accepts basic initial metadata (e.g., product name) and returns the newly created product ID, allowing the client to redirect to the wizard flow.

- **`PUT /products/:id`**
  Updates existing product data. Primarily used by the Product Wizard to auto-save progress, updating `current_step` and `completed_steps` as the user navigates the funnel.

- **`DELETE /products/:id`**
  Soft-deletes or archives a product. Removes the product from active dashboard queries.

### Blueprint

The intelligent assembly of a product's architecture is handled via a dedicated endpoint.

- **`POST /products/:id/blueprint`**
  **Purpose:** Triggers the generation or regeneration of the product blueprint based on the collected wizard data.
  **Expected Request:** Empty body, or specific generation parameters if needed. The server reads the current wizard state from the database.
  **Expected Response:** The compiled `blueprint` JSON object upon success.

## Response Philosophy

All API responses enforce a strict, uniform envelope. Consistency matters because it allows frontend clients to implement global, generalized fetch wrappers, drastically reducing boilerplate error handling code.

**Success Payload:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Failure Payload:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_IDENTIFIER",
    "message": "Human readable explanation."
  }
}
```

## Validation

Input validation is rigorously enforced at the routing edge before any database interaction occurs.

- **Required fields:** Rejecting requests missing essential payload data.
- **Empty strings:** Preventing whitespace-only submissions for critical fields.
- **Maximum lengths:** Truncating or rejecting overly long text inputs to prevent database bloat and abuse.
- **Invalid IDs:** Ensuring `:id` parameters are properly formatted UUIDs.
- **Unauthorized access:** Failing fast if session tokens are missing or invalid.

## Error Codes

The API strictly adheres to standard HTTP status codes to communicate request outcomes:

- **200 OK:** Request succeeded (used for GET, PUT, DELETE).
- **201 Created:** Resource successfully generated (used for POST).
- **400 Bad Request:** Client provided invalid data that failed schema validation.
- **401 Unauthorized:** Missing, expired, or invalid authentication session.
- **403 Forbidden:** Authenticated user attempting to access a resource they do not own.
- **404 Not Found:** The requested resource (e.g., a specific product ID) does not exist.
- **409 Conflict:** State conflict, such as attempting to generate a blueprint for a product lacking required wizard data.
- **422 Unprocessable Entity:** Payload is syntactically valid but semantically flawed.
- **500 Internal Server Error:** An unhandled exception or database failure occurred on the server.

## Security

Security rules are unapologetically strict:

- **Only authenticated users:** Anonymous requests to the API are immediately rejected.
- **Only owners can modify products:** Every single database query must include a strict `WHERE owner_id = :user_id` clause.
- **Never expose another user's data:** Data bleed between accounts is the ultimate failure state.
- **Always validate ownership:** Never trust a client-provided `user_id` payload; always extract identity strictly from the verified JWT session token.

## Future API

To maintain engineering focus, the following API capabilities are intentionally postponed:

- **AI Assistant:** Endpoints for generative AI brainstorming or text completion.
- **Templates:** Endpoints for cloning pre-existing architecture templates.
- **Teams & Collaboration:** Endpoints managing roles, permissions, and shared access.
- **Comments:** CRUD operations for line-level blueprint discussions.
- **Exports:** PDF or Markdown compilation endpoints.
- **Notifications:** Real-time event polling or webhook endpoints.
- **Version History:** Diffing or rollback endpoints for blueprints.
