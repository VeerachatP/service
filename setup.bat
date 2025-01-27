@echo off
echo Setting up the project...

REM Create project structure

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

REM Initialize backend in root
echo Installing backend...
call npm init -y

REM Create backend directory structure
mkdir src
mkdir src\config
mkdir src\controllers
mkdir src\middleware
mkdir src\routes
mkdir src\services
mkdir src\test
mkdir src\__tests__
mkdir dist

REM Install backend dependencies
call npm install express cors redis openai dotenv typescript ts-node
call npm install @types/express @types/cors @types/node @types/dotenv
call npm install ioredis @types/ioredis
call npm install jsonwebtoken @types/jsonwebtoken bcrypt @types/bcrypt
call npm install express-validator @types/express-validator
call npm install omise @types/omise
REM Testing dependencies
call npm install --save-dev jest @types/jest ts-jest supertest @types/supertest @types/node
REM Add types for test environment
call npm install --save-dev @jest/types @jest/environment

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
cd .. && call npm install
cd ..

echo.
echo Setup complete! You can now:
echo 1. cd client ^&^& npm start (for frontend^)
echo 2. cd server ^&^& npm run dev (for backend^)
echo Note: Make sure to update the .env file with your actual API keys
pause 