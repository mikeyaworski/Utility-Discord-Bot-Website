FROM node:16.9-alpine
WORKDIR /code
COPY package*.json ./
RUN npm ci --quiet
COPY . .
CMD ["npm", "start"]
