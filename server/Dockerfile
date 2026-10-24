# 1. Start from an official, ultra-lightweight Node.js Linux image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first (for Docker caching speed)
COPY package*.json ./

# 4. Install production dependencies inside Linux
RUN npm install --omit=dev

# 5. Copy the rest of the backend source code
COPY . .

# 6. Ensure the uploads directory exists for image uploads
RUN mkdir -p uploads

# 7. Expose port 5000 so outside traffic can reach Express
EXPOSE 5000

# 8. The command that starts the server inside the container
CMD ["node", "server.js"]