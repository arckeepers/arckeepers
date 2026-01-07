# Contributing to Arc Keepers

Thank you for your interest in contributing to Arc Keepers! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/arckeepers.git
   cd arckeepers
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-item-sorting` — New features
- `fix/search-escape-key` — Bug fixes
- `docs/update-readme` — Documentation updates
- `refactor/cleanup-store` — Code refactoring

### Code Style

- We use ESLint for linting. Run `npm run lint` before committing.
- Use TypeScript for all new code.
- Follow existing code patterns and conventions.
- Use meaningful variable and function names.

### Commit Messages

Write clear, concise commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters
- Reference issues when relevant: "Fix search bug (#123)"

### Pull Requests

1. **Create a feature branch** from `main`
2. **Make your changes** with clear commits
3. **Run linting:** `npm run lint`
4. **Test your changes** locally
5. **Push to your fork** and create a Pull Request
6. **Fill out the PR template** with a clear description

## Areas for Contribution

### Good First Issues

Look for issues labeled `good first issue` for beginner-friendly tasks.

### Feature Ideas

- Additional system keeplists for new game content
- Item sorting and filtering options
- Statistics and progress tracking
- Localization support

### Bug Reports

When reporting bugs, please include:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Feel free to open an issue for questions or discussions about the project.

---

Thank you for contributing! 🎮
