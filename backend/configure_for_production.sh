#!/bin/bash
# Production Configuration Script
# Run this to prepare backend/.env for production deployment

echo "🚀 Production Configuration Tool"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: backend/.env file not found!"
    exit 1
fi

echo "Current configuration:"
echo "---------------------"
grep "WEBHOOK_BASE_URL" .env || echo "WEBHOOK_BASE_URL not set"
grep "USE_WEBHOOK" .env || echo "USE_WEBHOOK not set"
echo ""

# Ask for production URL
echo "Enter your production URL (e.g., https://yourdomain.com):"
read -r PROD_URL

if [ -z "$PROD_URL" ]; then
    echo "❌ Error: Production URL cannot be empty"
    exit 1
fi

# Remove trailing slash if present
PROD_URL=${PROD_URL%/}

echo ""
echo "Updating backend/.env..."

# Update or add WEBHOOK_BASE_URL
if grep -q "WEBHOOK_BASE_URL" .env; then
    sed -i "s|WEBHOOK_BASE_URL=.*|WEBHOOK_BASE_URL=\"$PROD_URL\"|" .env
else
    echo "WEBHOOK_BASE_URL=\"$PROD_URL\"" >> .env
fi

# Update or add USE_WEBHOOK
if grep -q "USE_WEBHOOK" .env; then
    sed -i 's/USE_WEBHOOK=.*/USE_WEBHOOK="true"/' .env
else
    echo 'USE_WEBHOOK="true"' >> .env
fi

echo "✅ Configuration updated!"
echo ""
echo "Updated values:"
echo "---------------"
grep "WEBHOOK_BASE_URL" .env
grep "USE_WEBHOOK" .env
echo ""
echo "Next steps:"
echo "1. Commit and deploy your application"
echo "2. After deployment, run: python3 setup_webhook.py"
echo "3. Test your application at $PROD_URL"
