#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database name and user
DB_NAME="yapli-local"
DB_USER="postgres"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}       Yapli Database Setup Script          ${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

echo -e "\n${BLUE}Step 1:${NC} Checking if PostgreSQL is installed..."

# Check for Homebrew
if ! command_exists brew; then
  echo -e "${RED}Homebrew is not installed. Please install Homebrew first.${NC}"
  echo "Visit https://brew.sh for installation instructions."
  exit 1
fi

# Check for PostgreSQL client
if ! command_exists psql; then
  echo -e "${YELLOW}PostgreSQL client not found in PATH. Checking Homebrew installation...${NC}"
  
  # Check if PostgreSQL is installed via Homebrew
  if brew list postgresql@16 &>/dev/null || brew list postgresql &>/dev/null; then
    echo -e "${YELLOW}PostgreSQL is installed via Homebrew but not in PATH.${NC}"
    
    # Check which version is installed
    if brew list postgresql@16 &>/dev/null; then
      PG_PATH="/opt/homebrew/opt/postgresql@16/bin"
    else
      PG_PATH="/opt/homebrew/opt/postgresql/bin"
    fi
    
    echo -e "${YELLOW}Adding PostgreSQL to PATH for this session...${NC}"
    export PATH="$PG_PATH:$PATH"
    
    echo -e "${YELLOW}Consider adding this to your shell profile:${NC}"
    echo -e "  echo 'export PATH=\"$PG_PATH:\$PATH\"' >> ~/.zshrc"
  else
    echo -e "${YELLOW}PostgreSQL not found. Installing PostgreSQL 16...${NC}"
    brew install postgresql@16
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install PostgreSQL.${NC}"
      exit 1
    fi
    
    export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
    
    echo -e "${YELLOW}Consider adding PostgreSQL to your PATH:${NC}"
    echo -e "  echo 'export PATH=\"/opt/homebrew/opt/postgresql@16/bin:\$PATH\"' >> ~/.zshrc"
  fi
fi

# Start PostgreSQL service
echo -e "\n${BLUE}Step 2:${NC} Ensuring PostgreSQL service is running..."
if brew services list | grep postgresql | grep started &>/dev/null; then
  echo -e "${GREEN}PostgreSQL service is already running.${NC}"
else
  echo "Starting PostgreSQL service..."
  if brew list postgresql@16 &>/dev/null; then
    brew services start postgresql@16
  else
    brew services start postgresql
  fi
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start PostgreSQL service.${NC}"
    exit 1
  else
    echo -e "${GREEN}PostgreSQL service started successfully.${NC}"
  fi
  
  # Give PostgreSQL a moment to start up
  echo "Waiting for PostgreSQL to start..."
  sleep 3
fi

echo -e "\n${BLUE}Step 3:${NC} Setting up database user..."

# Create postgres superuser if it doesn't exist
psql -c "\du" postgres | grep postgres &>/dev/null
if [ $? -ne 0 ]; then
  echo "Creating postgres superuser..."
  createuser -s postgres
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create postgres user.${NC}"
    exit 1
  else
    echo -e "${GREEN}Created postgres superuser.${NC}"
  fi
else
  echo -e "${GREEN}Postgres superuser already exists.${NC}"
fi

echo -e "\n${BLUE}Step 4:${NC} Creating database..."

# Check if database already exists
psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
if [ $? -eq 0 ]; then
  echo -e "${YELLOW}Database '$DB_NAME' already exists.${NC}"
  read -p "Do you want to drop and recreate it? (y/N): " CONFIRM
  if [[ $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Dropping database '$DB_NAME'..."
    # Try to drop normally first
    if ! dropdb "$DB_NAME" 2>/dev/null; then
      echo -e "${YELLOW}Database is currently in use. Attempting to terminate connections...${NC}"
      # Terminate all connections to the database
      psql -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" postgres
      sleep 1
      # Try dropping again after terminating connections
      if ! dropdb "$DB_NAME" 2>/dev/null; then
        echo -e "${RED}Failed to drop database. Please manually stop applications that might be using the database and try again.${NC}"
        exit 1
      fi
    fi
    
    echo "Creating database '$DB_NAME'..."
    createdb "$DB_NAME"
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to recreate database.${NC}"
      exit 1
    else
      echo -e "${GREEN}Database recreated successfully.${NC}"
    fi
  else
    echo "Keeping existing database."
  fi
else
  echo "Creating database '$DB_NAME'..."
  createdb "$DB_NAME"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create database.${NC}"
    exit 1
  else
    echo -e "${GREEN}Database created successfully.${NC}"
  fi
fi

echo -e "\n${BLUE}Step 5:${NC} Creating .env file with database connection string..."

# Check if .env exists and if not, create it based on .env.example
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env file from .env.example template..."
    cp .env.example .env
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER@localhost:5432/$DB_NAME\"|g" .env
    echo -e "${GREEN}.env file created.${NC}"
  else
    echo "Creating new .env file..."
    cat > .env << EOF
EOF
    echo -e "${GREEN}.env file created.${NC}"
  fi
else
  echo -e "${YELLOW}.env file already exists.${NC}"
  read -p "Do you want to update the DATABASE_URL in .env? (y/N): " UPDATE_ENV
  if [[ $UPDATE_ENV =~ ^[Yy]$ ]]; then
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER@localhost:5432/$DB_NAME\"|g" .env
    echo -e "${GREEN}DATABASE_URL updated in .env file.${NC}"
  fi
fi

echo -e "\n${BLUE}Step 6:${NC} Running database migrations..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies.${NC}"
    exit 1
  else
    echo -e "${GREEN}Dependencies installed successfully.${NC}"
  fi
fi

# Run migrations
echo "Running Prisma migrations..."

# First, try normal migrations
npx prisma migrate deploy

# Additionally, ensure schema is fully applied (creates all tables from schema)
echo "Pushing complete schema to database..."
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to apply schema.${NC}"
  exit 1
else
  echo -e "${GREEN}Schema applied successfully.${NC}"
fi

echo -e "\n${BLUE}Step 7:${NC} Seeding database with test data..."

# Check if the seed script exists
if [ -f "prisma/seed.ts" ]; then
  # Add db:seed script to package.json if it doesn't exist
  if ! grep -q '"db:seed"' package.json; then
    echo "Adding db:seed script to package.json..."
    sed -i '' 's/"scripts": {/"scripts": {\n    "db:seed": "tsx prisma\/seed.ts",/g' package.json
  fi
  
  # Run seed script
  echo "Running seed script..."
  npm run db:seed
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to seed database.${NC}"
    exit 1
  else
    echo -e "${GREEN}Database seeded successfully.${NC}"
  fi
else
  echo -e "${YELLOW}No seed script found at prisma/seed.ts.${NC}"
  echo "To add test data, create a seed script at prisma/seed.ts."
fi

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}  Database setup completed successfully!      ${NC}"
echo -e "${GREEN}==============================================${NC}"
echo -e "\nYou can now start your application with: ${BLUE}npm run dev${NC}"
echo -e "Database connection: ${BLUE}postgresql://$DB_USER@localhost:5432/$DB_NAME${NC}"
echo -e "\nTo view database tables: ${BLUE}psql -d $DB_NAME -c '\\dt'${NC}"