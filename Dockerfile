FROM node:15

WORKDIR /

COPY package*.json ./

RUN npm install
RUN npm install node-fetch@2

COPY . .

EXPOSE 5000

CMD [ "node", "server.js" ]