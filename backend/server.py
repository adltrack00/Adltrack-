from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import emergentintegrations for LLM
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    logging.warning("emergentintegrations not available, copilot will use fallback responses")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# User models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Optional[str] = None

class SessionRequest(BaseModel):
    session_id: str
    role: Optional[str] = None

# Copilot models
class CopilotChatRequest(BaseModel):
    session_id: str
    message: str
    role: str = "caregiver"
    context: Optional[Dict[str, Any]] = None

class CopilotChatResponse(BaseModel):
    response: str
    session_id: str

# Store chat sessions
chat_sessions = {}

# Helper function to get current user from session
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(default=None)) -> Optional[User]:
    """Get current user from session token (cookie or header)"""
    token = session_token
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    # Find session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)


# Auth endpoints
@api_router.post("/auth/session")
async def create_session(request: SessionRequest, response: Response):
    """Exchange Emergent session_id for app session"""
    try:
        # Call Emergent auth API to get user data
        async with httpx.AsyncClient() as client_http:
            emergent_response = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id}
            )
            
            if emergent_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            user_data = emergent_response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one(
            {"email": user_data["email"]},
            {"_id": 0}
        )
        
        if existing_user:
            user_id = existing_user["user_id"]
            # Update user data if needed
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": user_data["name"],
                    "picture": user_data.get("picture"),
                    "role": request.role or existing_user.get("role")
                }}
            )
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.insert_one({
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture"),
                "role": request.role,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        # Create session
        session_token = f"sess_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )
        
        # Get updated user
        user_doc = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        return {
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "name": user_doc["name"],
            "picture": user_doc.get("picture"),
            "role": user_doc.get("role")
        }
        
    except httpx.HTTPError as e:
        logger.error(f"Error calling Emergent auth: {e}")
        raise HTTPException(status_code=500, detail="Authentication service error")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Get current authenticated user"""
    user = await get_current_user(request, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return UserResponse(
        user_id=user.user_id,
        email=user.email,
        name=user.name,
        picture=user.picture,
        role=user.role
    )

@api_router.post("/auth/update-role")
async def update_role(request: Request, role_data: dict, session_token: Optional[str] = Cookie(default=None)):
    """Update user's role"""
    user = await get_current_user(request, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    new_role = role_data.get("role")
    if new_role not in ["caregiver", "family", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"role": new_role}}
    )
    
    return {"message": "Role updated", "role": new_role}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(default=None)):
    """Logout and clear session"""
    token = session_token
    
    # Also check Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if token:
        # Delete session from database
        await db.user_sessions.delete_one({"session_token": token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}


# Existing endpoints
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Copilot endpoint
@api_router.post("/copilot/chat", response_model=CopilotChatResponse)
async def copilot_chat(request: CopilotChatRequest):
    """AI Copilot chat endpoint for caregivers and family members"""
    
    if request.role == "caregiver":
        system_message = """You are an AI Care Assistant for caregivers using ADLTrack. 
You help with care-related questions, task guidance, and documentation. 
Be concise, supportive, and focus on practical care advice.
IMPORTANT: Never provide medical diagnosis. For emergencies, always advise calling 911.
Keep responses brief and actionable."""
    else:
        system_message = """You are a Family Care Assistant for ADLTrack. 
You help family members understand their loved one's care plan, explain medical terms simply, 
and provide reassurance about the care being delivered.
Be warm, reassuring, and clear in your explanations.
IMPORTANT: Never provide medical diagnosis. For emergencies, always advise calling 911."""

    if LLM_AVAILABLE:
        try:
            api_key = os.environ.get('EMERGENT_LLM_KEY')
            if not api_key:
                raise ValueError("EMERGENT_LLM_KEY not found")
            
            if request.session_id not in chat_sessions:
                chat = LlmChat(
                    api_key=api_key,
                    session_id=request.session_id,
                    system_message=system_message
                ).with_model("gemini", "gemini-3-flash-preview")
                chat_sessions[request.session_id] = chat
            else:
                chat = chat_sessions[request.session_id]
            
            user_message = UserMessage(text=request.message)
            response = await chat.send_message(user_message)
            
            return CopilotChatResponse(response=response, session_id=request.session_id)
        except Exception as e:
            logger.error(f"Copilot error: {str(e)}")
            return CopilotChatResponse(
                response=get_fallback_response(request.message, request.role),
                session_id=request.session_id
            )
    else:
        return CopilotChatResponse(
            response=get_fallback_response(request.message, request.role),
            session_id=request.session_id
        )

def get_fallback_response(message: str, role: str) -> str:
    """Fallback responses when AI is unavailable"""
    lower_message = message.lower()
    
    if any(word in lower_message for word in ['emergency', '911', 'heart attack', 'not breathing', 'unconscious']):
        return "⚠️ EMERGENCY: If this is a medical emergency, please call 911 immediately. I cannot provide medical diagnosis or treatment advice."
    
    if role == "caregiver":
        if 'medication' in lower_message or 'medicine' in lower_message:
            return "For medication questions, always refer to the care plan and medication list. If unsure, contact the supervising nurse before administering."
        if 'transfer' in lower_message or 'lift' in lower_message:
            return "For safe transfers: 1) Ensure patient is ready, 2) Use proper body mechanics, 3) Use transfer aids when available, 4) Never rush. Request assistance if needed."
        if 'fall' in lower_message or 'fell' in lower_message:
            return "If a patient has fallen: 1) Stay calm, 2) Check for injuries before moving, 3) If head injury suspected, call for help, 4) Document with photos and notes."
    else:
        if 'how is' in lower_message or 'doing' in lower_message:
            return "Check the Timeline tab for completed tasks and caregiver notes. The Vitals section shows the latest health readings."
    
    return "I'm here to help with care-related questions. For medical emergencies, always call 911. What would you like to know?"


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
