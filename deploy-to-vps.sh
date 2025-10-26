#!/bin/bash

# TitleIQ Deployment Script for Hostinger VPS
# Usage: ./deploy-to-vps.sh

set -e

echo "🚀 TitleIQ Deployment Script"
echo "=============================="

# Configuration
VPS_HOST=${VPS_HOST:-"automations.tightslice.com"}
VPS_USER=${VPS_USER:-"root"}
VPS_PASSWORD=${VPS_PASSWORD:-"0/guhGJ''uPaNVz9lSuBw"}
DOMAIN="titleiq.titleslice.com"
APP_DIR="/var/www/titleiq"

echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

echo "📤 Uploading to VPS..."

# Create deployment package
tar czf titleiq-deploy.tar.gz \
  backend/ \
  frontend/dist/ \
  README.md \
  --exclude="node_modules" \
  --exclude="backend/database/*.db" \
  --exclude="*.log"

# Upload to VPS
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no \
  titleiq-deploy.tar.gz \
  $VPS_USER@$VPS_HOST:/tmp/

# Deploy on VPS
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no \
  $VPS_USER@$VPS_HOST << 'ENDSSH'

set -e

echo "🔧 Setting up TitleIQ on VPS..."

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Create app directory
mkdir -p /var/www/titleiq
cd /var/www/titleiq

# Extract deployment package
tar xzf /tmp/titleiq-deploy.tar.gz
rm /tmp/titleiq-deploy.tar.gz

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp .env.example .env

    # Generate secrets
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_SECRET=$(openssl rand -base64 32)

    # Update .env
    sed -i "s|your-secret-jwt-key-change-this|$JWT_SECRET|g" .env
    sed -i "s|your-secret-encryption-key-change-this|$ENCRYPTION_SECRET|g" .env
    sed -i "s|your-groq-api-key|GROQ_KEY_NEEDED|g" .env
    sed -i "s|http://localhost:3000|https://titleiq.titleslice.com|g" .env

    echo "⚠️  IMPORTANT: Edit backend/.env and add your GROQ_API_KEY"
fi

cd ..

# Stop existing PM2 processes if running
pm2 delete titleiq-backend 2>/dev/null || true
pm2 delete titleiq-frontend 2>/dev/null || true

# Start backend
echo "Starting backend..."
cd backend
pm2 start index.js --name titleiq-backend
cd ..

# Start frontend
echo "Starting frontend..."
pm2 serve frontend/dist 3000 --name titleiq-frontend --spa

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup | tail -n 1 | bash || true

echo "✅ Application started on PM2"
pm2 list

ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. SSH into VPS and edit backend/.env to add GROQ_API_KEY"
echo "2. Configure Nginx (see README.md)"
echo "3. Setup SSL with Let's Encrypt (see README.md)"
echo ""
echo "Quick commands:"
echo "  ssh $VPS_USER@$VPS_HOST"
echo "  nano /var/www/titleiq/backend/.env"
echo "  pm2 restart titleiq-backend"
