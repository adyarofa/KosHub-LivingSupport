FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

EXPOSE 3010

ENV NODE_ENV=production

CMD ["node", "index.js"]
