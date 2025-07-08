FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN chmod -R 755 node_modules/.bin

COPY . .

EXPOSE 3000

CMD ["npm", "start"]