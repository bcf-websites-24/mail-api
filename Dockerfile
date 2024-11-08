FROM node:20.17.0-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "npm", "start" ]