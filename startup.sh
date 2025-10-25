#!/bin/sh

echo "🚀 Starting Hackathoon 911 Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U hackathoon -d hackathoon_911; do
  echo "⏳ PostgreSQL is unavailable - sleeping for 2 seconds"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

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