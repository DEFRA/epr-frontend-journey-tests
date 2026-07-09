FROM node:26.5.0-alpine@sha256:e88a35be04478413b7c71c455cd9865de9b9360e1f43456be5951032d7ac1a66
WORKDIR /app
RUN npm init -y && npm install express
COPY ./docker/mock/waste.organisations.js .
EXPOSE 3020
CMD ["node", "waste.organisations.js"]
