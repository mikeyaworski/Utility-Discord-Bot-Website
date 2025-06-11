FROM node:20-alpine
WORKDIR /code
COPY package*.json ./
RUN npm ci --quiet
COPY . .
CMD ["npm", "start"]
