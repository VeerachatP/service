@echo off
echo Setting up the project...

REM Create project structure
mkdir baby-name-service
cd baby-name-service

REM Initialize frontend
echo Installing frontend...
call npx create-react-app client --template typescript
cd client
REM Install frontend dependencies
call npm install tailwindcss postcss autoprefixer @headlessui/react @heroicons/react
call npm install @types/node @types/react @types/react-dom
call npm install axios @types/axios
REM Initialize Tailwind
call npx tailwindcss init -p
cd ..

REM Initialize backend
echo Installing backend...
mkdir server
cd server
call npm init -y
REM Install backend dependencies
call npm install express cors redis openai dotenv typescript ts-node
call npm install @types/express @types/cors @types/node @types/dotenv
call npm install ioredis @types/ioredis
call npm install jsonwebtoken @types/jsonwebtoken bcrypt @types/bcrypt
call npm install express-validator @types/express-validator
REM Testing dependencies
call npm install --save-dev jest @types/jest ts-jest supertest @types/supertest @types/node
REM Add types for test environment
call npm install --save-dev @jest/types @types/jest-environment-node

REM Initialize TypeScript config
call npx tsc --init

REM Create Procfile for Railway
echo web: npm start> Procfile

REM Create .env file
echo REDIS_URL=redis://localhost:6379> .env
REM Generate a secure JWT_SECRET
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set JWT_SECRET=%%i
echo JWT_SECRET=%JWT_SECRET%>> .env
echo OMISE_PUBLIC_KEY=your-omise-public-key>> .env
echo OMISE_SECRET_KEY=your-omise-secret-key>> .env
echo OPENAI_API_KEY=your-openai-api-key>> .env

REM Install all dependencies
cd ..
echo Installing all dependencies...
cd client && call npm install
cd ../server && call npm install
cd ..

echo.
echo Setup complete! You can now:
echo 1. cd client ^&^& npm start (for frontend^)
echo 2. cd server ^&^& npm run dev (for backend^)
echo Note: Make sure to update the .env file with your actual API keys
pause 