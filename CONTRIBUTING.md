# Contributing

This is primarily a personal portfolio project, but contributions, issues, and suggestions
are welcome.

## Development Setup
Instructions will be added once the backend and frontend environments are established
(see project [Roadmap](README.md#roadmap)).

## Workflow
1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature`
2. Follow the existing code style (backend: `ruff` + `black`; frontend: `eslint` + `prettier`)
3. Write or update tests for any behavioral change
4. Open a pull request with a clear description of the change and why it's needed

## Commit Style
This project uses [Conventional Commits](https://www.conventionalcommits.org/), e.g.:
- `feat: add Grad-CAM heatmap generation`
- `fix: handle corrupt image upload gracefully`
- `docs: update API documentation for /predict`
- `test: add unit tests for image preprocessing`

## Code Review Expectations
- Keep pull requests focused on a single concern
- Prefer readable, well-named code over clever one-liners
- Public functions/classes should have type hints and docstrings
