#!/bin/bash

# TitleIQ SSL Setup Script
# Run this after DNS has propagated (5-30 minutes after adding DNS record)

set -e

echo "🔐 TitleIQ SSL Setup"
echo "===================="
echo ""

# Check DNS propagation
echo "📡 Checking DNS propagation..."
DNS_IP=$(dig @8.8.8.8 titleiq.titleslice.com A +short 2>/dev/null | head -1)

if [ -z "$DNS_IP" ]; then
    echo "❌ DNS not propagated yet. Please wait and try again."
    echo ""
    echo "You can check DNS status with:"
    echo "  dig @8.8.8.8 titleiq.titleslice.com"
    echo ""
    exit 1
fi

if [ "$DNS_IP" != "72.61.0.118" ]; then
    echo "❌ DNS is pointing to wrong IP: $DNS_IP (expected 72.61.0.118)"
    exit 1
fi

echo "✅ DNS propagated: titleiq.titleslice.com → $DNS_IP"
echo ""

# Setup SSL
echo "🔐 Setting up SSL certificate..."
ssh -i ~/.ssh/tightslice_deploy -o StrictHostKeyChecking=no root@automations.tightslice.com << 'ENDSSH'
certbot --nginx -d titleiq.titleslice.com --non-interactive --agree-tos --email noreply@titleslice.com --redirect
echo ""
echo "✅ SSL certificate installed!"
ENDSSH

echo ""
echo "✅ HTTPS is now active!"
echo ""
echo "🎉 TitleIQ is LIVE at: https://titleiq.titleslice.com"
echo ""
echo "Test the app:"
echo "1. Visit https://titleiq.titleslice.com"
echo "2. Click 'Try Builder Mode'"
echo "3. Paste a YouTube URL"
echo "4. Generate titles!"
