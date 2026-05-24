# Deployment Guide - Telegram Webhook Configuration

This guide explains how to deploy your application with proper Telegram bot webhook configuration.

## Overview

The application supports two modes for Telegram bot:
- **Polling Mode** (Development): Bot actively polls Telegram for updates
- **Webhook Mode** (Production): Telegram sends updates to your server via webhook

## Environment Variables

### Required Variables in `backend/.env`

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id_here"
WEBHOOK_BASE_URL="your_production_url_here"
USE_WEBHOOK="false"
```

### Variable Descriptions

- `WEBHOOK_BASE_URL`: Your deployed application URL (e.g., `https://yourdomain.com`)
- `USE_WEBHOOK`: Set to `"true"` for production, `"false"` for development

## Deployment Steps

### For Preview/Development Environment

1. Keep `USE_WEBHOOK="false"` in backend/.env
2. The `telegram_bot` service will use polling mode
3. Deploy normally

### For Production Deployment

1. **Update backend/.env with your production URL:**
   ```env
   WEBHOOK_BASE_URL="https://yourdomain.com"
   USE_WEBHOOK="true"
   ```

2. **Deploy your application** to Emergent platform

3. **Setup the webhook** (run this AFTER deployment):
   ```bash
   cd /app/backend
   python3 setup_webhook.py
   ```

4. **Verify webhook is configured:**
   ```bash
   python3 setup_webhook.py
   ```
   This will show current webhook status

5. **Test the webhook:**
   - Use your application at `https://yourdomain.com`
   - Submit a form to trigger Telegram notification
   - Click admin buttons in Telegram
   - They should work correctly now!

## Troubleshooting

### Check Webhook Status
```bash
cd /app/backend
python3 setup_webhook.py
```

### Switch Back to Polling Mode
1. Set `USE_WEBHOOK="false"` in backend/.env
2. Delete the webhook:
   ```bash
   python3 setup_webhook.py delete
   ```
3. Restart services:
   ```bash
   sudo supervisorctl restart telegram_bot backend
   ```

### Common Issues

**Issue: "Session not found" in production but works in preview**
- **Cause**: Webhook not configured or pointing to wrong URL
- **Solution**: Run `python3 setup_webhook.py` with correct `WEBHOOK_BASE_URL`

**Issue: Webhook gives error "Invalid SSL certificate"**
- **Cause**: Your domain needs valid SSL certificate
- **Solution**: Ensure your domain has proper HTTPS setup

**Issue: No Telegram notifications at all**
- **Cause**: Backend not running or webhook not receiving requests
- **Solution**: Check backend logs and verify webhook URL is accessible

## Architecture

### Development (Preview)
```
User → Preview Site → Preview Backend → Preview MongoDB
                            ↓
                      Telegram Bot (Polling) → Telegram API
```

### Production (Webhook)
```
User → Production Site → Production Backend → Production MongoDB
                                ↑
                         Telegram Webhook
                                ↑
                          Telegram API
```

## Key Differences

| Aspect | Polling (Dev) | Webhook (Production) |
|--------|--------------|---------------------|
| Bot Service | Runs continuously | Not needed |
| Updates | Bot polls Telegram | Telegram pushes to server |
| Latency | ~1-2 seconds | Instant |
| Resource Usage | Higher | Lower |
| Setup | Automatic | Requires configuration |

## Files Modified for Webhook Support

- `backend/.env` - Added webhook configuration variables
- `backend/setup_webhook.py` - New script for webhook management
- `backend/telegram_bot.py` - Updated to support both modes
- `backend/server.py` - Webhook endpoint already exists at `/api/telegram/webhook`

## Support

If you encounter issues during deployment:
1. Check deployment logs in Emergent Dashboard
2. Verify environment variables are correct
3. Run webhook setup script after deployment
4. Contact Emergent support on Discord if issues persist
