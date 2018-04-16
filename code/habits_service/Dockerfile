FROM node:8

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install

CMD [ "npm", "start" ]
