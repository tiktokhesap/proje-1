#!/usr/bin/env python3
"""
Setup Telegram Webhook
Run this script to configure Telegram bot to use webhooks instead of polling
"""

import requests
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

BOT_TOKEN = os.environ['TELEGRAM_BOT_TOKEN']
WEBHOOK_BASE_URL = os.environ.get('WEBHOOK_BASE_URL', '')
USE_WEBHOOK = os.environ.get('USE_WEBHOOK', 'false').lower() == 'true'

def setup_webhook():
    """Configure Telegram webhook"""
    if not WEBHOOK_BASE_URL:
        print("❌ WEBHOOK_BASE_URL not configured in .env")
        return False
    
    webhook_url = f"{WEBHOOK_BASE_URL}/api/telegram/webhook"

    api_url = f"https://api.telegram.org/bot{BOT_TOKEN}"

    print(f"Setting webhook to: {webhook_url}")

    response = requests.post(
        f"{api_url}/setWebhook",
        json={
            "url": webhook_url,
            "allowed_updates": ["callback_query"]
        }
    )

    result = response.json()
    print(result)

    if result.get("ok"):
        print("✅ Webhook set successfully!")
        return True
    else:
        print("❌ Failed:", result.get("description"))
        return False


def delete_webhook():
    api_url = f"https://api.telegram.org/bot{BOT_TOKEN}"
    print("Deleting webhook...")
    result = requests.post(f"{api_url}/deleteWebhook").json()
    print(result)


def get_webhook_info():
    api_url = f"https://api.telegram.org/bot{BOT_TOKEN}"
    result = requests.get(f"{api_url}/getWebhookInfo").json()
    print(result)
    return result


if __name__ == "__main__":
    import sys

    get_webhook_info()

    if USE_WEBHOOK:
        if len(sys.argv) > 1 and sys.argv[1] == "delete":
            delete_webhook()
        else:
            setup_webhook()
    else:
        print("Webhook disabled in .env")

if __name__ == "__main__":
    import sys

    get_webhook_info()

    if USE_WEBHOOK:
        if len(sys.argv) > 1 and sys.argv[1] == "delete":
            delete_webhook()
        else:
            setup_webhook()
    else:
        print("Webhook disabled in .env")



















# #!/usr/bin/env python3
# """
# Setup Telegram Webhook
# Run this script to configure Telegram bot to use webhooks instead of polling
# """

# import requests
# import os
# from dotenv import load_dotenv
# from pathlib import Path

# ROOT_DIR = Path(__file__).parent
# load_dotenv(ROOT_DIR / '.env')

# BOT_TOKEN = os.environ['TELEGRAM_BOT_TOKEN']
# WEBHOOK_BASE_URL = os.environ.get('WEBHOOK_BASE_URL', '')
# USE_WEBHOOK = os.environ.get('USE_WEBHOOK', 'false').lower() == 'true'

# def setup_webhook():
#     """Configure Telegram webhook"""
#     if not WEBHOOK_BASE_URL:
#         print("❌ WEBHOOK_BASE_URL not configured in .env")
#         return False
    
#     webhook_url = f"{WEBHOOK_BASE_URL}/api/telegram/webhook"
#     api_url = f"https://api.telegram.org/bot{BOT_TOKEN}"
    
#     print(f"Setting up webhook...")
#     print(f"Webhook URL: {webhook_url}")
    
#     # Set webhook
#     response = requests.post(
#         f"{api_url}/setWebhook",
#         json={
#             'url': webhook_url,
#             'allowed_updates': ['callback_query']
#         }
#     )
    
#     if response.status_code == 200:
#         result = response.json()
#         if result.get('ok'):
#             print("✅ Webhook configured successfully!")
#             print(f"Description: {result.get('description', '')}")
#             return True
#         else:
#             print(f"❌ Failed: {result.get('description', '')}")
#             return False
#     else:
#         print(f"❌ HTTP Error: {response.status_code}")
#         return False

# def delete_webhook():
#     """Remove webhook and return to polling mode"""
#     api_url = f"https://api.telegram.org/bot{BOT_TOKEN}"
    
#     print("Deleting webhook...")
#     response = requests.post(f"{api_url}/deleteWebhook")
    
#     if response.status_code == 200:
#         result = response.json()
#         if result.get('ok'):
#             print("✅ Webhook deleted successfully!")
#             return True
#         else:
#             print(f"❌ Failed: {result.get('description', '')}")
#             return False
#     else:
#         print(f"❌ HTTP Error: {response.status_code}")
#         return False

# def get_webhook_info():
#     """Get current webhook status"""
#     api_url = f"https://api.telegram.org/bot{BOT_TOKEN}"
    
#     response = requests.get(f"{api_url}/getWebhookInfo")
    
#     if response.status_code == 200:
#         result = response.json()
#         if result.get('ok'):
#             info = result.get('result', {})
#             print("\n=== Current Webhook Info ===")
#             print(f"URL: {info.get('url', 'Not set')}")
#             print(f"Has custom certificate: {info.get('has_custom_certificate', False)}")
#             print(f"Pending update count: {info.get('pending_update_count', 0)}")
#             if info.get('last_error_date'):
#                 print(f"Last error date: {info.get('last_error_date')}")
#                 print(f"Last error message: {info.get('last_error_message', '')}")
#             print("===========================\n")
#             return info
#     return None

# if __name__ == "__main__":
#     import sys
    
#     print("🤖 Telegram Webhook Configuration Tool\n")
    
#     # Show current status
#     get_webhook_info()
    
#     if USE_WEBHOOK:
#         print("📡 Webhook mode is ENABLED in .env")
#         if len(sys.argv) > 1 and sys.argv[1] == "delete":
#             delete_webhook()
#         else:
#             setup_webhook()
#     else:
#         print("🔄 Polling mode is ENABLED in .env")
#         print("To use webhooks:")
#         print("1. Set USE_WEBHOOK=true in backend/.env")
#         print("2. Run: python3 setup_webhook.py")
