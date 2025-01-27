# Create project structure
mkdir baby-name-service
cd baby-name-service

# Initialize frontend
npx create-react-app client --template typescript
cd client
# Install frontend dependencies
npm install tailwindcss postcss autoprefixer @headlessui/react @heroicons/react
npm install @types/node @types/react @types/react-dom
npm install axios @types/axios
# Initialize Tailwind
npx tailwindcss init -p
cd ..

# Initialize backend
mkdir server
cd server
npm init -y
# Install backend dependencies
npm install express cors redis openai dotenv typescript ts-node
npm install @types/express @types/cors @types/node @types/dotenv
npm install ioredis @types/ioredis
npm install jsonwebtoken @types/jsonwebtoken bcrypt @types/bcrypt
npm install express-validator @types/express-validator
# Testing dependencies
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest @types/node
# Add types for test environment
npm install --save-dev @jest/types @types/jest-environment-node

# Initialize TypeScript config
npx tsc --init

# Create .env file
echo "REDIS_URL=redis://localhost:6379
JWT_SECRET=your-development-secret-key
OMISE_PUBLIC_KEY=your-omise-public-key
OMISE_SECRET_KEY=your-omise-secret-key
OPENAI_API_KEY=your-openai-api-key" > .env

# Install dependencies for both projects
cd ..
echo "Installing all dependencies..."
cd client && npm install
cd ../server && npm install
cd ..

echo "Setup complete! You can now:
1. cd client && npm start (for frontend)
2. cd server && npm run dev (for backend)
Note: Make sure to update the .env file with your actual API keys" 