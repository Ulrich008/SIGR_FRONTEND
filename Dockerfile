# Stage 1 : Build Angular SSR
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2 : Run avec Node.js
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist/SIGR_FRONTEND/server ./server
COPY --from=builder /app/dist/SIGR_FRONTEND/browser ./browser
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "server/server.mjs"]