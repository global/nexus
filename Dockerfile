FROM node:22-alpine

ENV NODE_ENV=prod
WORKDIR /app

# Install dependencies first so this layer is cached unless package*.json changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY src ./src

# Runs as the non-root "node" user baked into the official image.
USER node

EXPOSE 3000

CMD ["node", "server.js"]
