# Stage 1: compile the TypeScript app into static files.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY tsconfig.json webpack.config.js ./
COPY src ./src
RUN npm run build

# Stage 2: serve the static bundle. No Node runtime ships in the final image.
FROM nginx:1.28-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
