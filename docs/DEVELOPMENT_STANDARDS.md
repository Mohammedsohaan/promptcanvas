# Development Standards

Document the coding standards for PromptCanvas Version 1.

---

## Naming Conventions

- **Files:** Use `kebab-case` for standard files and `PascalCase` for React components.
- **Folders:** Use `kebab-case` for all directories.
- **Components:** Use `PascalCase` (e.g., `ProductCard.tsx`).
- **Functions:** Use `camelCase` (e.g., `calculateTotal`).
- **Variables:** Use `camelCase` (e.g., `userList`).
- **Interfaces:** Use `PascalCase` (e.g., `UserProps`).
- **Types:** Use `PascalCase` (e.g., `ProductType`).

---

## Component Rules

- Components should have one responsibility.
- Components should stay small.
- Reusable components belong inside the `components` folder.
- Feature-specific components belong inside the `features` folder.

---

## Code Style

- Prefer readable code over clever code.
- Avoid duplicated logic.
- Keep functions short.
- Add comments only when necessary.
- Use TypeScript types whenever possible.

---

## Folder Rules

- **app:** Next.js pages, layouts, and routing logic.
- **components:** Reusable, global UI components.
- **features:** Domain-specific or page-specific components and logic.
- **hooks:** Custom React hooks.
- **lib:** Utility functions and shared helper files.
- **services:** API calls, database queries, and external integrations.
- **styles:** Global CSS files and Tailwind configuration.
- **types:** Shared TypeScript types and interfaces.
- **docs:** Project planning, architecture, and documentation files.

---

## Git Rules

- Make small, focused commits.
- Write meaningful commit messages.
- Push working code only.
- Never commit secrets or `.env` files.

---

## Notes

This document acts as the engineering handbook for PromptCanvas.
