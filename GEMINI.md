# Project Overview

This project is the frontend for KM.ai, a web application designed to be a "digital teaching assistant" for educators in Indonesia. The goal is to reduce teachers' administrative workload by providing tools to generate teaching materials, create quizzes, and track student progress.

The frontend is a single-page application built with **React** and **TypeScript**, using **Vite** for the build tooling. It is styled with **Tailwind CSS**. The UI components are based on **Radix UI** and **lucide-react** for icons.

# Building and Running

To get the project running locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Run the development server:**
    ```bash
    pnpm dev
    ```

3.  **Build for production:**
    ```bash
    pnpm build
    ```

4.  **Lint the code:**
    ```bash
    pnpm lint
    ```

# Development Conventions

*   **UI Components:** The project uses `shadcn/ui` for its UI components. The components are located in `src/components/ui`. The configuration for `shadcn/ui` is in the `components.json` file.
*   **TypeScript Configuration:** The project uses TypeScript with strict mode enabled. The code is compiled to ES2022, and it uses the `react-jsx` setting for JSX transformation. The module resolution strategy is set to `bundler`.
*   **Vite Configuration:** The project uses Vite for building and development. The configuration file (`vite.config.ts`) is set up to use the React plugin and Tailwind CSS. It also includes a path alias `@` which points to the `src` directory, so you can import modules from `src` using `import ... from '@/...'`.
*   **Package Manager:** The project uses `pnpm` for package management, as indicated by the `pnpm-lock.yaml` file.
*   **Styling:** Styling is done using Tailwind CSS. Utility classes should be used for styling components.
*   **Components:** Reusable UI components are located in `src/components/ui`.
*   **Linting:** The project uses ESLint for code linting. The configuration (`eslint.config.js`) extends the recommended rules from `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Run `pnpm lint` to check for linting errors.
