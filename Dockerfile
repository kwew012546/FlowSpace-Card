# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (development & production)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build Nuxt 4 production bundle
RUN npm run build

# Stage 2: Runtime runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Production environment configurations
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built server output and metadata
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Run database migrations and then launch the compiled Nuxt server
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
