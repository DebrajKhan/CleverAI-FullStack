import os

base_dir = "backend"

dirs = [
    "app",
    "app/core",
    "app/api",
    "app/api/v1",
    "app/api/v1/endpoints",
    "app/models",
    "app/schemas",
    "app/services",
    "app/db"
]

files = {
    "app/__init__.py": "",
    "app/core/__init__.py": "",
    "app/api/__init__.py": "",
    "app/api/v1/__init__.py": "",
    "app/api/v1/endpoints/__init__.py": "",
    "app/models/__init__.py": "",
    "app/schemas/__init__.py": "",
    "app/services/__init__.py": "",
    "app/db/__init__.py": "",
    
    "requirements.txt": """fastapi
uvicorn
motor
pydantic-settings
passlib[bcrypt]
PyJWT
python-multipart""",

    ".env": """MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=supersecretjwtkeythatyoushouldchange
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30""",

    ".gitignore": """__pycache__/
*.pyc
.env
venv/""",

    "app/core/config.py": """from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    JWT_SECRET: str = "supersecretjwtkeythatyoushouldchange"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()""",

    "app/core/security.py": """from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt""",

    "app/db/mongodb.py": """from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_client = MongoDB()

async def connect_to_mongo():
    db_client.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_client.db = db_client.client.cleverbook

async def close_mongo_connection():
    db_client.client.close()""",

    "app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(title="CleverBook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(api_router, prefix="/api/v1")""",

    "app/models/user_model.py": """from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
        
    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}""",

    "app/schemas/user_schema.py": """from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from app.models.user_model import PyObjectId

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    tier: Literal["School", "College"]

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str

class UserResponse(UserBase):
    id: str
    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str}

class Token(BaseModel):
    access_token: str
    token_type: str""",

    "app/api/dependencies.py": """from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings
from app.db.mongodb import db_client
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db_client.db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user""",

    "app/models/syllabus_model.py": """# Syllabus BSON definitions are handled via schemas and dynamic Motor inserts""",

    "app/schemas/syllabus_schema.py": """from pydantic import BaseModel
from typing import List, Optional

class Subtopic(BaseModel):
    id: str
    title: str
    completed: bool = False

class Topic(BaseModel):
    id: str
    title: str
    subtopics: List[Subtopic]

class Subject(BaseModel):
    id: str
    title: str
    topics: List[Topic]

class SyllabusTier(BaseModel):
    tier: str # "School" or "College"
    subjects: List[Subject]""",

    "app/services/ai_adaptive.py": """# Future cognitive misconception mapping
async def analyze_misconceptions(user_id: str, topic_id: str):
    pass""",

    "app/services/progress_calc.py": """def calculate_coverage(subjects: list) -> float:
    total_subtopics = 0
    completed_subtopics = 0
    
    for subject in subjects:
        for topic in subject.get("topics", []):
            for subtopic in topic.get("subtopics", []):
                total_subtopics += 1
                if subtopic.get("completed", False):
                    completed_subtopics += 1
                    
    if total_subtopics == 0:
        return 0.0
    return round((completed_subtopics / total_subtopics) * 100, 2)""",

    "app/api/v1/endpoints/users.py": """from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user_schema import UserCreate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.mongodb import db_client
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate):
    existing_user = await db_client.db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_in.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    result = await db_client.db.users.insert_one(user_dict)
    
    # Initialize empty syllabus for user
    default_syllabus = {
        "user_id": result.inserted_id,
        "tier": user_in.tier,
        "subjects": []
    }
    await db_client.db.syllabuses.insert_one(default_syllabus)
    
    created_user = await db_client.db.users.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    return created_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db_client.db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    current_user["id"] = str(current_user["_id"])
    return current_user""",

    "app/api/v1/endpoints/syllabus.py": """from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import db_client
from app.api.dependencies import get_current_user
from app.schemas.syllabus_schema import SyllabusTier

router = APIRouter()

@router.get("/", response_model=SyllabusTier)
async def get_syllabus(current_user: dict = Depends(get_current_user)):
    syllabus = await db_client.db.syllabuses.find_one({"user_id": current_user["_id"]})
    if not syllabus:
        raise HTTPException(status_code=404, detail="Syllabus not found")
    return syllabus

@router.post("/toggle_subtopic")
async def toggle_subtopic(subject_id: str, topic_id: str, subtopic_id: str, completed: bool, current_user: dict = Depends(get_current_user)):
    # In a real dynamic no-hardcode setup, this updates the specific nested element in MongoDB
    result = await db_client.db.syllabuses.update_one(
        {
            "user_id": current_user["_id"], 
            "subjects.id": subject_id,
            "subjects.topics.id": topic_id,
            "subjects.topics.subtopics.id": subtopic_id
        },
        {
            "$set": {"subjects.$[subj].topics.$[top].subtopics.$[sub].completed": completed}
        },
        array_filters=[
            {"subj.id": subject_id},
            {"top.id": topic_id},
            {"sub.id": subtopic_id}
        ]
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Subtopic not found or not updated")
    return {"status": "success", "completed": completed}

@router.post("/seed")
async def seed_syllabus(syllabus_data: SyllabusTier, current_user: dict = Depends(get_current_user)):
    # Helper endpoint to populate syllabus since no hardcoded data is allowed
    await db_client.db.syllabuses.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {"subjects": [s.model_dump() for s in syllabus_data.subjects], "tier": syllabus_data.tier}},
        upsert=True
    )
    return {"status": "seeded"}""",

    "app/api/v1/endpoints/metrics.py": """from fastapi import APIRouter, Depends
from app.db.mongodb import db_client
from app.api.dependencies import get_current_user
from app.services.progress_calc import calculate_coverage

router = APIRouter()

@router.get("/coverage")
async def get_coverage(current_user: dict = Depends(get_current_user)):
    syllabus = await db_client.db.syllabuses.find_one({"user_id": current_user["_id"]})
    if not syllabus or "subjects" not in syllabus:
        return {"coverage": 0.0}
    
    coverage = calculate_coverage(syllabus.get("subjects", []))
    return {"coverage": coverage}""",

    "app/api/v1/router.py": """from fastapi import APIRouter
from app.api.v1.endpoints import users, syllabus, metrics

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(syllabus.router, prefix="/syllabus", tags=["syllabus"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])"""
}

os.makedirs(base_dir, exist_ok=True)
for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

for filepath, content in files.items():
    with open(os.path.join(base_dir, filepath), "w") as f:
        f.write(content)

print("Backend scaffolded successfully!")
