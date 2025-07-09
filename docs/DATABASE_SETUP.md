# Database Setup Guide for Local Development

This guide explains how to set up a local PostgreSQL database for development using the provided `setup-db.sh` script. The script handles the installation of PostgreSQL (if needed), database creation, schema setup, and data seeding to provide you with a fully functional test environment.

## Prerequisites

Before running the setup script, ensure you have:

1. **MacOS** - The script is designed for MacOS with Homebrew
2. **Homebrew** - The script uses Homebrew to install PostgreSQL if needed
   - Install from [brew.sh](https://brew.sh) if not already installed
3. **Node.js** - Version 18 or higher is recommended
   - The project uses Next.js and Prisma which require Node.js

## Quick Start

For developers who want to get started quickly:

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/yourusername/yapli.git
cd yapli

# Make the setup script executable
chmod +x setup-db.sh

# Run the setup script
./setup-db.sh
```

The script will guide you through the setup process with clear prompts and colorful status messages.

## What the Setup Script Does

The `setup-db.sh` script performs the following tasks:

1. **Checks for PostgreSQL** - Verifies if PostgreSQL is installed and installs it via Homebrew if needed
2. **Ensures PostgreSQL is running** - Starts the PostgreSQL service if it's not already running
3. **Creates a database user** - Sets up the required Postgres superuser if needed
4. **Creates a database** - Creates the `yapli-local` database (or offers to recreate it if it exists)
5. **Sets up environment variables** - Creates or updates the `.env` file with the database connection string
6. **Applies database schema** - Runs Prisma migrations and ensures all tables are created
7. **Seeds the database** - Populates the database with test data for development

## Test Data

After running the setup script, your database will be populated with:

- **Test User**:
  - Email: `testuser@example.com`
  - Password: `password123`

- **Chat Rooms**:
  - General (`roomUrl`: `696fcd`)
  - Technology (`roomUrl`: `2zjbmc`)

- **Sample Messages**:
  - Messages from users "Alice", "Bob", "Charlie", and "Dana"
  - One message with a link preview

## Using the Database in Your Application

After setup, you can start the application with:

```bash
npm run dev
```

The application will connect to the local database using the connection string:

```
postgresql://postgres@localhost:5432/yapli-local
```

This connection string is automatically added to your `.env` file during setup.

## Common Issues and Troubleshooting

### PostgreSQL Not in PATH

If you see a warning about PostgreSQL not being in your PATH, consider adding it permanently:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Database In Use Error

If you encounter "database removal failed: ERROR: database is being accessed by other users" when trying to recreate the database, the script will automatically attempt to terminate connections. If this fails:

1. Close any applications that might be using the database (pgAdmin, other terminal sessions, etc.)
2. Run the setup script again

### Schema Changes

If you've made changes to the Prisma schema (`prisma/schema.prisma`), you may need to update the database schema:

```bash
npx prisma generate  # Update the Prisma client
npx prisma db push   # Push schema changes to the database
```

## Manually Viewing the Database

To view the database tables after setup:

```bash
psql -d yapli-local -c '\dt'        # List all tables
psql -d yapli-local -c 'SELECT * FROM chatrooms;'  # View chat rooms
```

## Resetting the Database

If you want to completely reset the database to a clean state:

```bash
npx prisma db push --force-reset    # Reset the database and apply schema
npm run db:seed                     # Re-seed with test data
```

Or simply run the setup script again and choose 'y' when asked if you want to recreate the database.