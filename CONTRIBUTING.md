# Contributing to GitID

First off, thank you for considering contributing to GitID! It's people like you that make GitID such a great tool for the open-source community.

We welcome all contributions—from bug reports to new features, documentation improvements, and beyond. This document will guide you through our standard workflow.

## 🌿 Branching Strategy

Our repository uses the following branching model:
- **`main`**: The production branch. Stable code only.
- **`system-redesign`**: The active development branch. 

> [!CAUTION]
> **Never push directly to `main` or `system-redesign`.** All changes must go through a Pull Request targeting the `system-redesign` branch.

## 🚀 How to Contribute

To contribute, follow this standard fork-and-pull workflow:

1. **Fork the repository** to your own GitHub account.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/devpassport.git
   cd devpassport
   ```
3. **Add the upstream remote** to sync your fork later:
   ```bash
   git remote add upstream https://github.com/Saniyakubu/devpassport.git
   ```
4. **Checkout the development branch**:
   ```bash
   git checkout system-redesign
   ```
5. **Create a new feature branch** from `system-redesign`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

### Branch Naming Conventions
Use descriptive branch names with the following prefixes:
- `feat/` - for new features (e.g. `feat/add-new-card`)
- `fix/` - for bug fixes (e.g. `fix/mobile-scroll`)
- `docs/` - for documentation updates (e.g. `docs/update-readme`)
- `chore/` - for maintenance tasks (e.g. `chore/update-dependencies`)

## 💻 Local Setup & Commands

After checking out your branch, install the project dependencies. This project supports both `npm` and `bun`. 

```bash
# Install dependencies
npm install  # or bun install

# Start the development server
npm run dev  # or bun run dev
```

Before submitting a Pull Request, please ensure your code passes linting, type checks, and builds successfully:

```bash
# Run the linter
npm run lint

# Verify the production build (runs type checks automatically)
npm run build
```

## 📝 Coding Standards & Commits

- **Keep it clean:** Write clean, readable code and follow the existing patterns in the codebase.
- **Remove comments:** Avoid leaving unused commented-out code blocks or structural comments.
- **Conventional Commits:** We follow [Conventional Commits](https://www.conventionalcommits.org/). Please format your commit messages accordingly:
  - `feat: add new retro terminal card`
  - `fix: resolve mobile scrolling lock bug`
  - `docs: update setup instructions`
  - `chore: bump dependencies`

## ✅ Pull Request Checklist

When you are ready to submit your PR, open it against the **`system-redesign`** branch and ensure you have completed the following:

- [ ] My code follows the existing style guidelines of this project.
- [ ] I have successfully run `npm run lint` and `npm run build` locally.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code in complex areas (while avoiding unnecessary structural comments).
- [ ] My commit messages follow the Conventional Commits format.
- [ ] My branch is up to date with `upstream/system-redesign`.

Once again, thank you for contributing!
