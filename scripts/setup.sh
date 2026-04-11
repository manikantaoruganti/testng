#!/bin/bash

# scripts/setup.sh
# This script automates the initial setup for CrisisOS.

echo "Starting CrisisOS project setup..."

# 1. Install root dependencies
echo "Installing root dependencies..."
npm install || { echo "Failed to install root dependencies."; exit 1; }

# 2. Install client dependencies
echo "Installing client dependencies..."
cd client
npm install || { echo "Failed to install client dependencies."; exit 1; }
cd ..

# 3. Install server dependencies
echo "Installing server dependencies..."
cd server
npm install || { echo "Failed to install server dependencies."; exit 1; }
cd ..

# 4. Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating default .env file..."
  cp .env.example .env # Assuming a .env.example exists, or create a basic one
  echo "
# Server Configuration
PORT=3000
MONGO_URI=mongodb://localhost:27017/crisis_os_db
JWT_SECRET=your_jwt_secret_key_here

# Client Configuration (for Vite)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=ws://localhost:3000
" > .env
  echo ".env file created. Please review and update it with your actual configurations."
else
  echo ".env file already exists. Skipping creation."
fi

# 5. Seed the database (requires MongoDB to be running)
echo "Attempting to seed the database. Ensure MongoDB is running locally or accessible via MONGO_URI in .env."
node server/src/db/seed.js || { echo "Database seeding failed. Please ensure MongoDB is running and accessible."; }

echo "CrisisOS setup complete! You can now run 'npm run dev' to start the application."
