# Git Workflow

Document the development workflow for PromptCanvas.

---

## Branch Strategy

Version 1 will use a single branch:

- `main`

Future versions may introduce:

- `develop`
- `feature/*`
- `hotfix/*`

---

## Daily Workflow

Every development session should follow this order:

1. Pull the latest changes (if working across multiple devices)
2. Build one small feature
3. Test the feature locally
4. Check Git status
5. Commit with a meaningful message
6. Push to GitHub

---

## Commit Message Style

Examples:

- Add login page
- Build dashboard layout
- Create product wizard
- Add product validation
- Improve navigation
- Fix responsive sidebar

Avoid messages like:

- update
- fix
- changes
- final
- test

---

## Rules

- Commit small changes frequently.
- Never commit broken code.
- Never commit secrets or .env files.
- Push code at the end of every work session.

---

## Notes

Git history should clearly show how the project evolved over time.
