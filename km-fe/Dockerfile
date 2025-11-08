# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

ENV VITE_API_BASE=https://kmai-api-1079341308711.us-central1.run.app/api

COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
