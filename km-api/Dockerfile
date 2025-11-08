FROM node:22-alpine AS base

RUN apk add --no-cache gcompat
WORKDIR /app

FROM base AS builder
WORKDIR /app

# Copy dependency metadata
COPY package*.json tsconfig.json ./

# Install deps
RUN npm install

# Copy source code
COPY src ./src

# Build & prune
RUN npm run build && npm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/dist ./dist
COPY --from=builder --chown=hono:nodejs /app/package.json .

USER hono
EXPOSE 3000
CMD ["node", "dist/index.js"]
