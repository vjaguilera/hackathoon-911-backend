#!/bin/sh

echo "🚀 Starting Hackathoon 911 Backend..."

# Check if we're using Cloud SQL (Unix socket) or regular TCP connection
if echo "$DATABASE_URL" | grep -q "host=/cloudsql/"; then
  echo "📡 Detected Cloud SQL connection - skipping pg_isready check"
  echo "✅ Assuming Cloud SQL is ready!"
else
  echo "⏳ Waiting for PostgreSQL to be ready..."
  # Extract database connection details from DATABASE_URL
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

  # Default values if extraction fails
  DB_HOST=${DB_HOST:-localhost}
  DB_PORT=${DB_PORT:-5432}
  DB_USER=${DB_USER:-postgres}
  DB_NAME=${DB_NAME:-postgres}

  until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME; do
    echo "⏳ PostgreSQL is unavailable - sleeping for 2 seconds"
    sleep 2
  done
  echo "✅ PostgreSQL is ready!"
fi
# Test database connection
echo "🔍 Testing database connection..."
npx prisma db pull --force || echo "⚠️  Could not pull schema (this is normal for a new database)"

# Run database migrations
echo "📊 Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "⚠️  Migration failed, trying to push schema..."
  npx prisma db push
fi

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "✅ Database setup complete!"

# Start the application
echo "🚀 Starting the application..."
exec npm start