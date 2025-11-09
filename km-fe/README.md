KM Frontend (km-fe)

Purpose
- React + Vite frontend for KM.ai dashboard.

Dev
- Install: `pnpm install`
- Run: `pnpm dev`
- Build: `pnpm build`

Env
- `VITE_API_BASE` (defaults to `http://localhost:8787/api`)

Notes
- Uses React Router; main flows: classes, materials, exams, students.
- Exam detail supports downloading questions and per-student operations when available.

