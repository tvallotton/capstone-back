FROM node:16
WORKDIR /usr/src/app
COPY . .
RUN npm i
EXPOSE 5000