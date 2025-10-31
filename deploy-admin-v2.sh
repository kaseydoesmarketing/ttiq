#!/bin/bash
# TitleIQ Admin Dashboard v2 - Deployment Script
# Deploys backend routes and frontend build to VPS

set -e

echo "🚀 TitleIQ Admin Dashboard v2 Deployment"
echo "========================================="

# Configuration
SERVER="root@automations.tightslice.com"
SSH_KEY="~/.ssh/tightslice_deploy"
BACKEND_PATH="/var/www/titleiq/backend"
FRONTEND_PATH="/var/www/titleiq/frontend"
LOCAL_BACKEND="./backend"
LOCAL_FRONTEND="./frontend"

echo ""
echo "📦 Step 1: Deploying backend files..."
echo "--------------------------------------"

# Upload new route files
scp -i $SSH_KEY \
  $LOCAL_BACKEND/routes/adminStats.js \
  $LOCAL_BACKEND/routes/adminLLMUsage.js \
  $LOCAL_BACKEND/routes/adminLive.js \
  $SERVER:$BACKEND_PATH/routes/

# Upload updated files
scp -i $SSH_KEY \
  $LOCAL_BACKEND/routes/generate.js \
  $LOCAL_BACKEND/index.js \
  $SERVER:$BACKEND_PATH/

echo "✅ Backend files uploaded"

echo ""
echo "🔄 Step 2: Restarting backend PM2..."
echo "--------------------------------------"

ssh -i $SSH_KEY $SERVER << 'EOF'
  cd /var/www/titleiq/backend
  pm2 restart titleiq-backend
  pm2 logs titleiq-backend --lines 20
EOF

echo "✅ Backend restarted"

echo ""
echo "🏗️  Step 3: Building frontend..."
echo "--------------------------------------"

cd $LOCAL_FRONTEND
npm run build

echo "✅ Frontend built"

echo ""
echo "📤 Step 4: Deploying frontend build..."
echo "--------------------------------------"

# Upload dist folder
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  $LOCAL_FRONTEND/dist/ \
  $SERVER:$FRONTEND_PATH/dist/

echo "✅ Frontend deployed"

echo ""
echo "🎉 Deployment Complete!"
echo "========================================="
echo ""
echo "🔗 Access Points:"
echo "   Admin Dashboard: https://titleiq.tightslice.com/admin"
echo "   Admin v2 (viz):  https://titleiq.tightslice.com/admin?viz=1"
echo ""
echo "🧪 Test Endpoints:"
echo "   curl -H \"Authorization: Bearer \$TOKEN\" https://titleiq.tightslice.com/api/admin/stats/overview"
echo "   curl -H \"Authorization: Bearer \$TOKEN\" https://titleiq.tightslice.com/api/admin/llm-usage"
echo "   curl -H \"Authorization: Bearer \$TOKEN\" https://titleiq.tightslice.com/api/admin/live"
echo ""
echo "📊 Monitor logs:"
echo "   ssh -i $SSH_KEY $SERVER 'pm2 logs titleiq-backend'"
echo ""
