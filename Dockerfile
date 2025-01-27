# Use Node.js LTS
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install && npm run postinstall

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Create necessary directories
RUN mkdir -p dist/config

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD [ "npm", "start" ] 