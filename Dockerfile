FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV TZ=Europe/Budapest \
    NODE_ENV=production

EXPOSE 5000

CMD [ "node", "server.js" ]