#!/bin/bash
#
# ZEROFAIL EMERGENCY FIX - Groq Model Update
# This script deploys the critical fix for deprecated Groq API model
#

set -e

echo "════════════════════════════════════════════════════════════"
echo "ZEROFAIL EMERGENCY FIX DEPLOYMENT"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Fix: Update Groq model from llama-3.1-70b to llama-3.3-70b"
echo "Impact: Restores title generation functionality"
echo "Risk: LOW (one-line change in model name)"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Configuration
VPS_HOST="root@72.61.0.118"
VPS_DIR="/var/www/titleiq/backend/utils"
LOCAL_FILE="/Users/kvimedia/titleiq/backend/utils/llm.js"

# Step 1: Verify local fix is applied
echo "✓ Step 1: Verifying local fix..."
if grep -q "llama-3.3-70b-versatile" "$LOCAL_FILE"; then
    echo "  ✅ Local file contains updated model name"
else
    echo "  ❌ ERROR: Local file still has old model name"
    echo "  Run: nano $LOCAL_FILE"
    echo "  Change line 170 to: model: 'llama-3.3-70b-versatile',"
    exit 1
fi

# Step 2: Backup remote file
echo ""
echo "✓ Step 2: Creating backup on VPS..."
ssh "$VPS_HOST" "cp $VPS_DIR/llm.js $VPS_DIR/llm.js.backup-$(date +%Y%m%d-%H%M%S)" || {
    echo "  ❌ SSH connection failed"
    echo "  Please check SSH credentials and try again"
    exit 1
}
echo "  ✅ Backup created"

# Step 3: Deploy fixed file
echo ""
echo "✓ Step 3: Deploying fixed file to VPS..."
scp "$LOCAL_FILE" "$VPS_HOST:$VPS_DIR/llm.js" || {
    echo "  ❌ File transfer failed"
    exit 1
}
echo "  ✅ File deployed successfully"

# Step 4: Restart backend
echo ""
echo "✓ Step 4: Restarting backend service..."
ssh "$VPS_HOST" "pm2 restart titleiq-backend" || {
    echo "  ❌ PM2 restart failed"
    exit 1
}
echo "  ✅ Backend restarted"

# Step 5: Wait for service to be ready
echo ""
echo "✓ Step 5: Waiting for service to initialize..."
sleep 3

# Step 6: Test the fix
echo ""
echo "✓ Step 6: Testing title generation..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://72.61.0.118/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"This is a test video about productivity tips and time management strategies","type":"text"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ API returned 200 OK"

    # Check if response contains titles
    if echo "$BODY" | grep -q '"titles"'; then
        echo "  ✅ Response contains titles array"

        # Count titles
        TITLE_COUNT=$(echo "$BODY" | grep -o '"' | grep -c '' || echo "0")
        echo "  ✅ Title generation is working!"

        echo ""
        echo "Sample output:"
        echo "$BODY" | jq -r '.titles[0:3][]' 2>/dev/null || echo "$BODY"
    else
        echo "  ⚠️  Response does not contain expected titles"
        echo "  Response: $BODY"
    fi
else
    echo "  ❌ API returned HTTP $HTTP_CODE"
    echo "  Response: $BODY"
    echo ""
    echo "Fix may not have worked. Check PM2 logs:"
    echo "  ssh $VPS_HOST 'pm2 logs titleiq-backend --lines 30'"
    exit 1
fi

# Success
echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ EMERGENCY FIX DEPLOYED SUCCESSFULLY"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Title generation is now working with Groq model: llama-3.3-70b-versatile"
echo ""
echo "Next steps:"
echo "1. Test in browser: http://72.61.0.118"
echo "2. Request ZEROFAIL re-certification"
echo "3. Once DNS propagates, run: ./setup-ssl.sh"
echo ""
echo "═══════════════════════════════════════════════════════════"
