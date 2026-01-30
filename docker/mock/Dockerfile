FROM node:18-alpine
WORKDIR /app
RUN npm init -y && npm install express
COPY ./docker/mock/waste.organisations.js .
EXPOSE 3020
CMD ["node", "waste.organisations.js"]
