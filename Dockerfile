FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
ENV PORT=8080

CMD [ "npm", "run", "start" ]
