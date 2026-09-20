# Server Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

# Production image
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/test ./test
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3006
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
