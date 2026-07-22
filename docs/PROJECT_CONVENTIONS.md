# PromptCanvas Project Conventions

This document establishes the long-term conventions for developing and contributing to PromptCanvas. It is designed to act as the primary operational guide for every future contributor to the project.

## Philosophy

PromptCanvas should always prioritize:

- **Simplicity:** The most straightforward solution is almost always the correct one.
- **Consistency:** Uniform patterns across the codebase reduce the cognitive load for all contributors.
- **Maintainability:** Code is read exponentially more often than it is written; optimize for reading.
- **Long-term Scalability:** Architectures must be able to gracefully absorb complexity without requiring full rewrites.

Every new feature should feel like a natural extension of the existing application, rather than an isolated module.

## File Naming

Consistent naming conventions ensure predictability when navigating the codebase.

- **Components:** `PascalCase`.
  _Example:_ `ProductCard.tsx`
- **Hooks:** `camelCase`, prefixed with "use".
  _Example:_ `useProducts.ts`
- **Utilities:** `camelCase`.
  _Example:_ `formatDate.ts`
- **Pages:** Strict Next.js App Router conventions.
  _Examples:_ `page.tsx`, `layout.tsx`, `loading.tsx`
- **Constants:** `UPPER_SNAKE_CASE`.
  _Example:_ `MAX_API_RETRIES`

## Component Rules

React components are the building blocks of our UI. Strict discipline here prevents long-term technical debt. Components should:

- **Have one responsibility:** A component should do one thing exceptionally well.
- **Remain reusable:** Build primitives that can be assembled in multiple contexts.
- **Avoid duplicated logic:** Extract repeated `useEffect` or complex state manipulations into custom hooks.
- **Avoid excessive props:** If a component requires a massive list of props, it is likely doing too much and should be composed using `children` or split into smaller units.
- **Avoid deep nesting:** Extract complex branches of a render tree into well-named sub-components.

## Folder Rules

To prevent any folder from becoming a disorganized dumping ground, responsibilities are strictly siloed:

- **`app/`:** Only Next.js App Router structural files. No standalone components or business logic.
- **`components/`:** React components, organized strictly by domain or feature.
- **`hooks/`:** Reusable React custom hooks.
- **`lib/`:** Third-party client wrappers, utility functions, schemas, and helper logic.
- **`services/`:** Core business logic and external API integrations, separated entirely from UI rendering.
- **`types/`:** Global TypeScript type definitions and interfaces.
- **`docs/`:** Centralized project documentation, architectural decisions, and operational guidelines.
- **`public/`:** Static assets like images, fonts, and icons.

## Styling Rules

- **Tailwind CSS only:** All styles must be generated using Tailwind utility classes.
- **Avoid custom CSS:** Avoid writing custom CSS unless absolutely necessary for complex animations or overrides.
- **Keep spacing consistent:** Rely entirely on the default Tailwind spacing scale to maintain visual rhythm.
- **Use shared UI components:** Never manually style a button or input field if a shared primitive exists. Use shared UI components whenever possible.
- **Do not duplicate utility classes:** Do not duplicate complex utility classes across multiple files; extract them into a shared component.

## Motion Rules

Animations must never be used solely for decoration. Motion should always communicate meaning and guide the user's attention.

Examples of valid motion:

- page transitions
- workflow progression
- loading
- success
- navigation

**Rule:** Avoid decorative animation. Motion should always support usability.

## Documentation Rules

Documentation is a first-class citizen in the PromptCanvas repository. Documentation should evolve alongside the code. Every major feature should include:

- **Purpose:** Why does this feature exist?
- **Architecture:** How does this feature integrate with the existing systems?
- **Implementation notes:** Any complex algorithms or specific decisions.
- **Future improvements:** Known technical debt or planned enhancements.

## Git Workflow

To maintain a pristine repository, each feature should strictly follow this lifecycle:

1. **Plan**
2. **Implement**
3. **Review**
4. **Commit**
5. **Push**

**Mandatory Rule:** Never commit broken code. Every commit must leave the project in a buildable, working state.

## Versioning

**Version 1 Goals:** Deliver the tightest, most focused single-player product planning experience possible.

Future versions should extend functionality without breaking existing behavior.

## PromptCanvas Development Principle

Whenever a design or technical decision is unclear, fall back on our singular guiding principle:

_We build software that helps people think before they build software._
