import uuid
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import db, client

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def parse_datetime(value) -> datetime:
    """Convert an ISO-format string to a datetime, or return as-is."""
    if isinstance(value, str):
        return datetime.fromisoformat(value)
    return value


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    username: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    email: str
    full_name: str
    username: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None


class ProjectCreate(BaseModel):
    title: str
    description: str
    tech_stack: List[str]
    category: str
    status: str = "in_progress"
    thumbnail_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    media_urls: List[str] = []


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    category: Optional[str] = None
    status: Optional[str] = None
    thumbnail_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    media_urls: Optional[List[str]] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    project_id: str
    user_email: str
    user_username: str
    user_full_name: str
    title: str
    description: str
    tech_stack: List[str]
    category: str
    status: str
    thumbnail_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    media_urls: List[str] = []
    created_at: datetime
    updated_at: datetime


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------


def _user_response(user: dict) -> UserResponse:
    """Build a UserResponse from a raw MongoDB document."""
    return UserResponse(
        email=user["email"],
        full_name=user["full_name"],
        username=user["username"],
        bio=user.get("bio"),
        avatar_url=user.get("avatar_url"),
        github_url=user.get("github_url"),
        linkedin_url=user.get("linkedin_url"),
        website_url=user.get("website_url"),
        location=user.get("location"),
        skills=user.get("skills", []),
        created_at=parse_datetime(user["created_at"]),
    )


def _project_response(project: dict) -> ProjectResponse:
    """Build a ProjectResponse from a raw MongoDB document."""
    project["created_at"] = parse_datetime(project["created_at"])
    project["updated_at"] = parse_datetime(project["updated_at"])
    return ProjectResponse(**project)


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await client.admin.command("ping")
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error("Failed to connect to MongoDB: %s", e)
    yield
    # Shutdown
    client.close()


# ---------------------------------------------------------------------------
# App & middleware
# ---------------------------------------------------------------------------

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Auth Routes
# ---------------------------------------------------------------------------


@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    user_dict = {
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "username": user_data.username,
        "bio": None,
        "avatar_url": None,
        "github_url": None,
        "linkedin_url": None,
        "website_url": None,
        "location": None,
        "skills": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.users.insert_one(user_dict)

    access_token = create_access_token(data={"sub": user_data.email})
    user_response = _user_response(user_dict)

    return Token(access_token=access_token, token_type="bearer", user=user_response)


@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user_data.email})
    return Token(access_token=access_token, token_type="bearer", user=_user_response(user))


@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_response(current_user)


@api_router.put("/auth/me", response_model=UserResponse)
async def update_me(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}

    if update_data:
        await db.users.update_one({"email": current_user["email"]}, {"$set": update_data})

    updated_user = await db.users.find_one({"email": current_user["email"]}, {"_id": 0})
    return _user_response(updated_user)


@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        return {"message": "If an account exists with this email, a reset link has been sent."}

    token_data = {"sub": request.email, "type": "reset"}
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    token_data.update({"exp": expire})
    reset_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    reset_link = f"http://localhost:3000/reset-password/{reset_token}"
    logger.info("PASSWORD RESET LINK for %s: %s", request.email, reset_link)

    return {"message": "If an account exists with this email, a reset link has been sent."}


@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPassword):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = get_password_hash(data.new_password)
    await db.users.update_one({"email": email}, {"$set": {"password": hashed_password}})

    return {"message": "Password reset successfully"}


# ---------------------------------------------------------------------------
# User Routes
# ---------------------------------------------------------------------------


@api_router.get("/users/{username}", response_model=UserResponse)
async def get_user_by_username(username: str):
    user = await db.users.find_one({"username": username}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)


# ---------------------------------------------------------------------------
# Project Routes
# ---------------------------------------------------------------------------


@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project_data: ProjectCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()

    project_dict = project_data.model_dump()
    project_dict["project_id"] = str(uuid.uuid4())
    project_dict["user_email"] = current_user["email"]
    project_dict["user_username"] = current_user["username"]
    project_dict["user_full_name"] = current_user["full_name"]
    project_dict["created_at"] = now
    project_dict["updated_at"] = now

    await db.projects.insert_one(project_dict)
    return _project_response(project_dict)


@api_router.get("/projects", response_model=List[ProjectResponse])
async def get_all_projects(category: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status

    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [_project_response(p) for p in projects]


@api_router.get("/projects/my", response_model=List[ProjectResponse])
async def get_my_projects(current_user: dict = Depends(get_current_user)):
    projects = (
        await db.projects.find({"user_email": current_user["email"]}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(100)
    )
    return [_project_response(p) for p in projects]


@api_router.get("/projects/user/{username}", response_model=List[ProjectResponse])
async def get_user_projects(username: str):
    projects = (
        await db.projects.find({"user_username": username}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(100)
    )
    return [_project_response(p) for p in projects]


@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_response(project)


@api_router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
):
    project = await db.projects.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project["user_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")

    update_data = {k: v for k, v in project_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.projects.update_one({"project_id": project_id}, {"$set": update_data})

    updated_project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    return _project_response(updated_project)


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project["user_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")

    await db.projects.delete_one({"project_id": project_id})
    return {"message": "Project deleted successfully"}


# ---------------------------------------------------------------------------
# Mount router
# ---------------------------------------------------------------------------

app.include_router(api_router)