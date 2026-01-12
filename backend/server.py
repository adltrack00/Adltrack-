from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

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


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

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

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Copilot endpoint
@api_router.post("/copilot/chat", response_model=CopilotChatResponse)
async def copilot_chat(request: CopilotChatRequest):
    """AI Copilot chat endpoint for caregivers and family members"""
    
    # Get system message based on role
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
            
            # Create or get chat session
            if request.session_id not in chat_sessions:
                chat = LlmChat(
                    api_key=api_key,
                    session_id=request.session_id,
                    system_message=system_message
                ).with_model("gemini", "gemini-3-flash-preview")
                chat_sessions[request.session_id] = chat
            else:
                chat = chat_sessions[request.session_id]
            
            # Send message and get response
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
    
    # Emergency detection
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()