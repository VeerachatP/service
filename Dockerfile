# Use Node.js LTS
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install && npm run postinstall

# Copy and build client
COPY client/package*.json ./client/
RUN cd client && npm install --legacy-peer-deps
COPY client/tailwind.config.js client/postcss.config.js ./client/
COPY client ./client/
RUN cd client && npm install --save-dev @babel/plugin-proposal-private-property-in-object@7.21.11
RUN cd client && CI=true npm run build

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