
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ 

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache libstdc++

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

ENV TZ=Europe/Budapest \
    NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
