# Project Overview

This project is a full-stack web application called KM.ai, designed as a "digital teaching assistant" for educators in Indonesia. The goal is to reduce teachers' administrative workload by providing tools to generate teaching materials, create quizzes, and track student progress.

The application consists of three main parts:
- A single-page application frontend built with **React** and **TypeScript**, using **Vite** for the build tooling. It is styled with **Tailwind CSS**, and the UI components are based on **Radix UI** and **lucide-react** for icons.
- A backend API built with **Node.js** and **Hono**, a lightweight web framework. It uses a **PostgreSQL** database for data storage.
- A suite of end-to-end tests written with **Cypress**.

The entire application is containerized using **Docker** and can be orchestrated with **Docker Compose**.

# Building and Running

The project is divided into several services, each with its own build and run commands. The easiest way to get the entire application running is to use Docker Compose.

## Docker Compose

To build and run the entire application:
```bash
docker-compose up --build
```

This will start the frontend, backend, and database services.
- The frontend will be available at `http://localhost:5173`
- The backend API will be available at `http://localhost:8787`
- The PostgreSQL database will be available at `localhost:5432`

## Frontend (`km-fe`)

To run the frontend development server:
```bash
cd km-fe
pnpm install
pnpm dev
```

To build the frontend for production:
```bash
cd km-fe
pnpm build
```

To lint the frontend code:
```bash
cd km-fe
pnpm lint
```

## Backend (`km-api`)

To run the backend development server:
```bash
cd km-api
pnpm install
pnpm dev
```

To build the backend for production:
```bash
cd km-api
pnpm build
```

## Testing (`test`)

To run the Cypress end-to-end tests:
```bash
cd test
pnpm install
pnpm cypress open
```

# Development Conventions

*   **Package Manager:** The project uses `pnpm` for package management in both the frontend and backend, as indicated by the `pnpm-lock.yaml` files.
*   **Frontend:**
    *   **UI Components:** The project uses `shadcn/ui` for its UI components. The components are located in `km-fe/src/components/ui`. The configuration for `shadcn/ui` is in the `components.json` file.
    *   **TypeScript Configuration:** The project uses TypeScript with strict mode enabled. The code is compiled to ES2022, and it uses the `react-jsx` setting for JSX transformation. The module resolution strategy is set to `bundler`.
    *   **Vite Configuration:** The project uses Vite for building and development. The configuration file (`vite.config.ts`) is set up to use the React plugin and Tailwind CSS. It also includes a path alias `@` which points to the `src` directory, so you can import modules from `src` using `import ... from '@/...'`.
    *   **Styling:** Styling is done using Tailwind CSS. Utility classes should be used for styling components.
    *   **Linting:** The project uses ESLint for code linting. The configuration (`eslint.config.js`) extends the recommended rules from `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Run `pnpm lint` to check for linting errors.
*   **Backend:**
    *   The backend is a Node.js application written in TypeScript, using Hono as the web framework.
    *   It connects to a PostgreSQL database. The database schema is defined in `sql/schema.sql`.
*   **Testing:**
    *   End-to-end tests are written using Cypress. The test files are located in `test/cypress/e2e`.
    *   The Cypress configuration is in `test/cypress.config.ts`.
