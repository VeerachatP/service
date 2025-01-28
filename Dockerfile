# Use Node.js LTS
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install && npm run postinstall

# Copy client files and build client
COPY client ./client/
RUN cd client && \
    npm install --legacy-peer-deps && \
    CI=true npm run build

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV CI=true

# Start the server
CMD [ "npm", "start" ] 