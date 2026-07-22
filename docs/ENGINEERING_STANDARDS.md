# PromptCanvas Engineering Standards

This document establishes the definitive engineering standards for PromptCanvas. It serves as the primary reference for writing production-quality code, ensuring alignment across the entire engineering team.

## Philosophy

PromptCanvas prioritizes long-term engineering health over short-term velocity. Code should always be written for humans first. Every technical decision must optimize for:

- **Readability**
- **Maintainability**
- **Scalability**
- **Consistency**
- **Performance**
- **Simplicity**

## TypeScript

TypeScript is the foundation of our application safety.

- **Never use "any":** Disabling the type checker defeats the purpose of the language. Use `unknown` if a type is truly dynamic, followed by strict type narrowing.
- **Prefer explicit interfaces:** Define the shape of all props, API responses, and complex state objects explicitly.
- **Use strict typing:** Compiler configuration must remain highly restrictive.
- **Prefer type safety over convenience:** Do not suppress compiler errors using `@ts-ignore` unless interfacing with broken third-party definitions.
- **Reuse existing types whenever possible:** Prevent structural drift by utilizing global types found in the `types/` directory.

## React Components

- **Each component should have a single responsibility.**
- **Keep components small:** If a file exceeds 200 lines, carefully evaluate whether it should be broken down.
- **Avoid deeply nested JSX:** Extract logical blocks into smaller sub-components to keep the render function flat and readable.
- **Extract reusable UI when duplication appears:** Abstract it into a shared primitive.
- **Favor composition over large components:** Overload components with `children` and composition patterns rather than enormous `props` lists that manage internal branching logic.

## Next.js

- **Use App Router:** Adhere strictly to the Next.js `app/` directory paradigm.
- **Prefer Server Components where appropriate:** Default to Server Components for all data fetching and layout generation.
- **Only use Client Components when interactivity is required:** Append the `"use client"` directive at the lowest possible leaf node.
- **Keep `page.tsx` files minimal:** Page files should act only as data-fetching orchestrators. Delegate heavy JSX to feature components.

## Naming Conventions

Predictable naming prevents confusion and speeds up onboarding.

- **Components:** `PascalCase`
  Example: `ProductCard.tsx`
- **Hooks:** `camelCase`
  Example: `useProducts.ts`
- **Utilities:** `camelCase`
  Example: `formatDate.ts`
- **Constants:** `UPPER_SNAKE_CASE`
  Example: `MAX_RETRIES`

## Folder Organization

Strict structural boundaries ensure a predictable codebase.

- **`app/`:** Contains exclusively routing files (`page.tsx`, `layout.tsx`, `route.ts`).
- **`components/`:** Visual and interactive React components, organized by domain.
- **`hooks/`:** Reusable React custom hooks for abstracting component state and lifecycle logic.
- **`lib/`:** Infrastructure wrappers, schemas, utility functions, and environment helpers.
- **`services/`:** Core business logic, data mutation orchestrations, and API integrations independent of UI.
- **`types/`:** Global TypeScript interfaces and types representing our data models.
- **`docs/`:** Internal project documentation, architectural blueprints, and guidelines.
- **`public/`:** Static assets, fonts, and images served directly to the browser.

## Styling Standards

- **Use Tailwind CSS:** All styling must be achieved using utility classes.
- **Avoid inline styles:** `style={{ ... }}` is generally forbidden unless executing dynamic JavaScript calculations.
- **Keep utility classes readable:** Break exceedingly long class strings logically.
- **Extract repeated patterns into reusable components:** Do this rather than creating complex CSS abstractions.
- **Maintain consistent spacing and typography:** Stick rigorously to the defined spacing and typography scales.

## Accessibility

Our software must be universally usable.

- **Semantic HTML:** Use native elements over generic `<div>` tags.
- **Keyboard navigation:** All interactive elements must be fully accessible.
- **Visible focus states:** Focus rings must never be hidden without proper visual replacements.
- **Proper labels:** Associate labels with inputs and provide `aria-label` attributes where text is absent.
- **High color contrast:** Text must easily pass contrast standards against its background.
- **Respect reduced motion:** Disable complex animations for sensitive users.

## Performance

- **Avoid unnecessary re-renders:** Utilize memoization appropriately when passing props to heavy child components.
- **Lazy load when appropriate:** Use dynamic imports for large, non-critical components.
- **Optimize images:** Always use native image optimization components.
- **Minimize client-side JavaScript:** Push maximum logic to Server Components.
- **Prefer server rendering where possible:** Serve static or server-rendered HTML whenever possible to improve Core Web Vitals.

## Git Standards

Commit messages should strictly follow Conventional Commits to maintain an automatable history.

Examples:

- `feat:` A new feature.
- `fix:` A bug fix.
- `refactor:` Code changes that neither fix a bug nor add a feature.
- `docs:` Documentation-only changes.
- `style:` Changes that do not affect the meaning of the code (formatting).
- `test:` Adding missing tests or correcting existing ones.
- `chore:` Changes to the build process or auxiliary tools.

**Mandatory Rule:** Every commit should leave the project in a working state.

## Code Reviews

Every new feature should be rigorously reviewed for:

- **Readability**
- **Performance**
- **Accessibility**
- **Security**
- **Consistency**
- **Maintainability**

## PromptCanvas Engineering Principle

Avoid clever code. Prefer obvious code.

_Every feature should make the application easier to understand, easier to maintain, and easier to extend._
