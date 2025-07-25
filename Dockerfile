# --- Install dependencies and build app ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies early for better layer caching
COPY package*.json ./

# Use npm ci for deterministic installs in CI/CD and Docker
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js app for production
RUN npm run build

# --- Production image ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tsconfig.json ./

# Expose Next.js production port
EXPOSE 3000

# Use Next.js built-in start for production
CMD ["npx", "next", "start"]
