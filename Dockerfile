FROM node:14
WORKDIR /app
COPY package*.json ./
COPY . .

USER root

RUN npm install
EXPOSE 4000
CMD [ "npm", "start" ]
