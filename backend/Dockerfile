FROM node:20-bullseye AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

FROM node:20-bullseye
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
