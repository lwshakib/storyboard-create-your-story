# Contributing to Storyboard

Thank you for considering contributing to Storyboard! We welcome individuals who want to help us improve the platform, whether it's by fixing bugs, improving documentation, or adding new features.

The following is a set of guidelines for contributing to Storyboard. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 🚀 How to Contribute

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Use the GitHub Issues search** — check if the issue has already been reported.
- **Check if the issue has been fixed** — try to reproduce it using the latest `main` branch.
- **Isolate the problem** — ideally create a reduced test case.

**If you find a closed issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.**

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible.
- **Explain why this enhancement would be useful** to most Storyboard users.

### Pull Requests

1.  **Fork the repo** and create your branch from `main`.
2.  **Clone the project** to your own machine.
3.  **Create a new branch**.
    ```bash
    git checkout -b my-new-feature
    ```
4.  **Make your changes** and commit them.
    - We use conventional commits (e.g., `feat: add new feature`, `fix: resolve crash`).
5.  **Push to your fork** and submit a **Pull Request**.
    ```bash
    git push origin my-new-feature
    ```
6.  **Create a PR** on GitHub.

### Code Style Standards

- **TypeScript**: We use TypeScript for type safety. Please ensure there are no `any` types unless absolutely necessary.
- **Styling**: We use Tailwind CSS. Avoid writing custom CSS in global files unless it's a reusable utility.
- **Linting**: Run `npm run lint` before committing to ensure your code follows our standards.

## 🛠 Development Setup

1.  Clone the repository.
2.  Install dependencies: `bun install` (recommended) or `npm install`.
3.  Set up your `.env` file (see [README.md](README.md)).
4.  Run the development server: `npm run dev`.

## 💬 Community

If you have any questions, feel free to start a discussion in the Issues tab or reach out to the maintainers.

Thank you for contributing!
