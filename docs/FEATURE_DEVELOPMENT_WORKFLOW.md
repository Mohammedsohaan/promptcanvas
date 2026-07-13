# PromptCanvas Feature Development Workflow

This document defines how every new feature should be designed, reviewed, implemented, tested, and released in PromptCanvas.

## Purpose

Every feature should follow the same predictable lifecycle. The goal of this strict workflow is to maintain software quality, structural consistency, and long-term maintainability across the entire engineering team.

## Development Lifecycle

Every feature follows this strict chronological order:

1. **Identify the problem**
2. **Define the user experience**
3. **Design the architecture**
4. **Define the data model**
5. **Plan implementation**
6. **Build**
7. **Review**
8. **Test**
9. **Commit**
10. **Push**
11. **Document**

No feature should skip these steps.

## Feature Checklist

Before implementation begins, every feature should answer:

- What problem does this solve?
- Who benefits?
- Is it required for Version 1?
- Does it fit PromptCanvas?
- Can it be simplified?
- Does it introduce technical debt?
- Is it reusable?
- Is it scalable?

## Implementation Rules

Every feature should:

- be modular
- be reusable
- be documented
- include proper typing
- avoid duplicated logic
- follow existing design patterns

## Review Checklist

Review every feature strictly for:

- readability
- accessibility
- responsiveness
- performance
- maintainability
- consistency
- security

## Testing Checklist

Before merging into the main branch, verify:

- No TypeScript errors
- No ESLint errors
- Production build succeeds
- Responsive layout verified
- Keyboard navigation verified
- No console errors

## Git Workflow

Each feature should result in meaningful commits. Use Conventional Commits.

Examples:

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `style:`
- `test:`
- `chore:`

## Documentation

Every major feature should update the following as necessary:

- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `ROADMAP.md` (if required)
- Relevant architecture documentation

## PromptCanvas Philosophy

Every feature should answer one question:

*"Does this make planning software easier?"*

If the answer is no, reconsider implementing it.
