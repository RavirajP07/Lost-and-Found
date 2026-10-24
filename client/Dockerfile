# -----------------------------------------------
# Stage 1: Build the React Application
# -----------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production static files
COPY . .
RUN npm run build

# -----------------------------------------------
# Stage 2: Serve with High-Performance Nginx
# -----------------------------------------------
FROM nginx:alpine

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from Stage 1 into Nginx web folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]