# Contributing to Auto Diako Hub

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/auto-diako-hub.git
   cd auto-diako-hub
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and LLM API keys (see the README for details).

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch from `main` for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and ensure the code compiles:
   ```bash
   npm run build
   ```
3. Run the linter:
   ```bash
   npm run lint
   ```
4. Commit your changes with a clear, descriptive message.
5. Push to your fork and open a Pull Request against `main`.

## Code Style

- **TypeScript** — all code should be typed
- **Functional patterns** — prefer functions and hooks over classes
- **Tailwind CSS** — use utility classes; avoid custom CSS unless necessary
- **shadcn/ui** — use existing UI components from `components/ui/` where possible
- Keep files focused — one component per file

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include steps to reproduce, expected behavior, and actual behavior
- Screenshots or error logs are helpful

## Pull Request Guidelines

- Keep PRs focused on a single change
- Reference related issues (e.g., "Fixes #42")
- Ensure the build passes before requesting review
- Add a brief description of what changed and why

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
