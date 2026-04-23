FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm ci

COPY src ./src

RUN npx prisma generate
RUN npm run build

# --- Production image ---
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Sincroniza schema (db push, ideal para hackathon) e inicia o servidor
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node dist/server.js"]
