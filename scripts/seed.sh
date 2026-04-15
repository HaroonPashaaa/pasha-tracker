#!/bin/bash
# Seed script for initial data

set -e

echo "🌱 Seeding database..."

# Seed known exchange wallets
npx ts-node scripts/seed-exchanges.ts

# Seed known off-ramp addresses
npx ts-node scripts/seed-offramps.ts

echo "✅ Seeding complete!"
