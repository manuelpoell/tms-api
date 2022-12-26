FROM node:18.12.1-alpine3.15 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:18.12.1-alpine3.15 AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
RUN mkdir /var/log
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
