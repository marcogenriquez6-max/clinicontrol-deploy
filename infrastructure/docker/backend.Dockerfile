ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* tsconfig*.json nest-cli.json ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    addgroup --system --gid 1002 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup app

ENV NODE_ENV=production

COPY --from=deps --chown=app:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=app:appgroup /app/dist ./dist
COPY --from=builder --chown=app:appgroup /app/package.json ./package.json

RUN mkdir -p /app/data && chown app:appgroup /app/data

RUN npm cache clean --force

USER app

EXPOSE 3001

ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
