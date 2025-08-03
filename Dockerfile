FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml tsconfig*.json ./
RUN npm install -g pnpm typescript && pnpm install
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate \
    && pnpm build \
    && (ls -la dist && echo "Build succeeded - dist exists") || echo "Build failed - dist missing"

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache bash python3 make g++ \
    && npm install -g pnpm
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# The seed script should now be compiled to dist/prisma/seed.js
CMD ["bash", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/src/main.js"]