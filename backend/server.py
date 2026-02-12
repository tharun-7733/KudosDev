import bcrypt
import logging

# ---------------------------------------------------------------------------
# Compatibility Patches (Applied first!)
# ---------------------------------------------------------------------------
# Fix for passlib/bcrypt incompatibility in newer versions (4.1+)
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (object,), {"__version__": bcrypt.__version__})

import re
import uuid
import os
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
    try:
        # Try passlib first
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.warning(f"Passlib verification failed, trying direct bcrypt: {e}")
        try:
            # Fallback to direct bcrypt
            if isinstance(hashed_password, str):
                hashed_password_bytes = hashed_password.encode("utf-8")
            else:
                hashed_password_bytes = hashed_password
                
            result = bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password_bytes)
            if result:
                logger.info("Direct bcrypt verification succeeded")
            return result
        except Exception as e2:
            logger.error(f"Direct bcrypt verification also failed: {e2}")
            return False


def get_password_hash(password: str) -> str:
    try:
        # Try passlib first
        return pwd_context.hash(password)
    except Exception as e:
        logger.warning(f"Passlib hashing failed, trying direct bcrypt: {e}")
        try:
            # Fallback to direct bcrypt (returns string for DB storage)
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
            return hashed.decode("utf-8")
        except Exception as e2:
            logger.error(f"Direct bcrypt hashing also failed: {e2}")
            raise e2


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


# --- Blog Models ---

class BlogCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    content_markdown: str = ""
    cover_image_url: Optional[str] = None
    tags: List[str] = []
    category: str = "devlog"
    tech_stack: List[str] = []
    linked_project_id: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    status: str = "draft"  # draft | published


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content_markdown: Optional[str] = None
    cover_image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    linked_project_id: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class BlogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    blog_id: str
    slug: str
    title: str
    subtitle: Optional[str] = None
    content_markdown: str
    cover_image_url: Optional[str] = None
    author_email: str
    author_username: str
    author_full_name: str
    tags: List[str] = []
    category: str
    tech_stack: List[str] = []
    linked_project_id: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    status: str
    word_count: int = 0
    reading_time_minutes: int = 1
    view_count: int = 0
    comment_count: int = 0
    reaction_count: int = 0
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class CommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[str] = None


class CommentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    comment_id: str
    blog_id: str
    parent_comment_id: Optional[str] = None
    author_email: str
    author_username: str
    author_full_name: str
    content: str
    upvotes: int = 0
    created_at: datetime


class ReactionCreate(BaseModel):
    type: str  # fire | rocket | bulb | clap | heart


# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------


def generate_slug(title: str) -> str:
    """Generate a URL-friendly slug from a title with a short UUID suffix."""
    base = re.sub(r"[^\w\s-]", "", title.lower().strip())
    base = re.sub(r"[\s_]+", "-", base)
    base = re.sub(r"-+", "-", base).strip("-")
    suffix = str(uuid.uuid4())[:8]
    return f"{base}-{suffix}" if base else suffix


def calculate_reading_time(text: str) -> int:
    """Estimate reading time in minutes (238 wpm average)."""
    words = len(text.split())
    return max(1, round(words / 238))



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
    p = project.copy()
    
    # Ensure ID is a string
    if "_id" in p:
        del p["_id"]
        
    # Handle dates safely
    p["created_at"] = parse_datetime(p.get("created_at", datetime.now(timezone.utc).isoformat()))
    p["updated_at"] = parse_datetime(p.get("updated_at", datetime.now(timezone.utc).isoformat()))
    
    # Ensure lists exist
    p["tech_stack"] = p.get("tech_stack", [])
    p["media_urls"] = p.get("media_urls", [])
    
    # Defaults for other required fields if missing
    p["description"] = p.get("description", "")
    p["category"] = p.get("category", "Uncategorized")
    p["status"] = p.get("status", "in_progress")
    
    return ProjectResponse(**p)


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

    # Ensure the default admin user exists and has the correct password
    try:
        admin_email = "admin@gmail.com"
        seed_user_data = {
            "email": admin_email,
            "password": get_password_hash("admin"),
            "full_name": "Admin User",
            "username": "adminuser",
            "bio": "Default admin account for KudosDev",
            "avatar_url": None,
            "github_url": None,
            "linkedin_url": None,
            "website_url": None,
            "location": None,
            "skills": ["React", "Python", "FastAPI"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        
        # Use update_one with upsert=True to force the credentials to be correct
        await db.users.update_one(
            {"email": admin_email},
            {"$set": seed_user_data},
            upsert=True
        )
        logger.info("Admin user verified and credentials reset → admin@gmail.com / admin")
    except Exception as e:
        logger.warning("Could not ensure admin user: %s", e)

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
    try:
        logger.info(f"Login attempt for: {user_data.email}")
        user = await db.users.find_one({"email": user_data.email})
        
        if not user:
            logger.warning(f"User not found in DB: {user_data.email}")
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        # Verify password with detailed debug logging if it fails
        if not verify_password(user_data.password, user["password"]):
            logger.warning(f"Invalid password for: {user_data.email}. Received: '{user_data.password}'")
            raise HTTPException(status_code=401, detail="Incorrect email or password")

        logger.info(f"Login successful for: {user_data.email}")
        access_token = create_access_token(data={"sub": user_data.email})
        return Token(access_token=access_token, token_type="bearer", user=_user_response(user))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Internal error during login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


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
    try:
        logger.info(f"Fetching projects for user: {current_user['email']}")
        projects = (
            await db.projects.find({"user_email": current_user["email"]}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(100)
        )
        logger.info(f"Found {len(projects)} projects for {current_user['email']}")
        
        response_data = []
        for p in projects:
            try:
                response_data.append(_project_response(p))
            except Exception as e:
                logger.error(f"Error building ProjectResponse for project {p.get('project_id')}: {e}")
                # We could continue or raise
        
        return response_data
    except Exception as e:
        logger.error(f"Unexpected error in get_my_projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
# Blog endpoints
# ---------------------------------------------------------------------------


def _blog_response(blog: dict) -> BlogResponse:
    """Build a BlogResponse from a raw MongoDB document."""
    b = blog.copy()
    if "_id" in b:
        del b["_id"]
    b["created_at"] = parse_datetime(b.get("created_at", datetime.now(timezone.utc).isoformat()))
    b["updated_at"] = parse_datetime(b.get("updated_at", datetime.now(timezone.utc).isoformat()))
    if b.get("published_at"):
        b["published_at"] = parse_datetime(b["published_at"])
    b["tags"] = b.get("tags", [])
    b["tech_stack"] = b.get("tech_stack", [])
    b["content_markdown"] = b.get("content_markdown", "")
    b["category"] = b.get("category", "devlog")
    b["status"] = b.get("status", "draft")
    b["word_count"] = b.get("word_count", 0)
    b["reading_time_minutes"] = b.get("reading_time_minutes", 1)
    b["view_count"] = b.get("view_count", 0)
    b["comment_count"] = b.get("comment_count", 0)
    b["reaction_count"] = b.get("reaction_count", 0)
    return BlogResponse(**b)


@api_router.post("/blogs", response_model=BlogResponse)
async def create_blog(blog_data: BlogCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    word_count = len(blog_data.content_markdown.split())
    blog_dict = blog_data.model_dump()
    blog_dict["blog_id"] = str(uuid.uuid4())
    blog_dict["slug"] = generate_slug(blog_data.title)
    blog_dict["author_email"] = current_user["email"]
    blog_dict["author_username"] = current_user["username"]
    blog_dict["author_full_name"] = current_user["full_name"]
    blog_dict["word_count"] = word_count
    blog_dict["reading_time_minutes"] = calculate_reading_time(blog_data.content_markdown)
    blog_dict["view_count"] = 0
    blog_dict["comment_count"] = 0
    blog_dict["reaction_count"] = 0
    blog_dict["created_at"] = now
    blog_dict["updated_at"] = now
    if blog_data.status == "published":
        blog_dict["published_at"] = now
    else:
        blog_dict["published_at"] = None
    await db.blogs.insert_one(blog_dict)
    return _blog_response(blog_dict)


@api_router.get("/blogs", response_model=List[BlogResponse])
async def get_all_blogs(
    tag: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
):
    query = {"status": "published"}
    if tag:
        query["tags"] = tag
    if category:
        query["category"] = category
    blogs = (
        await db.blogs.find(query, {"_id": 0})
        .sort("published_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )
    return [_blog_response(b) for b in blogs]


@api_router.get("/blogs/my", response_model=List[BlogResponse])
async def get_my_blogs(current_user: dict = Depends(get_current_user)):
    blogs = (
        await db.blogs.find({"author_email": current_user["email"]}, {"_id": 0})
        .sort("updated_at", -1)
        .to_list(100)
    )
    return [_blog_response(b) for b in blogs]


@api_router.get("/blogs/{slug}", response_model=BlogResponse)
async def get_blog_by_slug(slug: str):
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    # Increment view count
    await db.blogs.update_one({"slug": slug}, {"$inc": {"view_count": 1}})
    blog["view_count"] = blog.get("view_count", 0) + 1
    return _blog_response(blog)


@api_router.put("/blogs/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: str,
    blog_update: BlogUpdate,
    current_user: dict = Depends(get_current_user),
):
    blog = await db.blogs.find_one({"blog_id": blog_id})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog["author_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {k: v for k, v in blog_update.model_dump().items() if v is not None}
    if "content_markdown" in update_data:
        update_data["word_count"] = len(update_data["content_markdown"].split())
        update_data["reading_time_minutes"] = calculate_reading_time(update_data["content_markdown"])
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.blogs.update_one({"blog_id": blog_id}, {"$set": update_data})
    updated = await db.blogs.find_one({"blog_id": blog_id}, {"_id": 0})
    return _blog_response(updated)


@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, current_user: dict = Depends(get_current_user)):
    blog = await db.blogs.find_one({"blog_id": blog_id})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog["author_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.blogs.delete_one({"blog_id": blog_id})
    await db.comments.delete_many({"blog_id": blog_id})
    await db.reactions.delete_many({"blog_id": blog_id})
    return {"message": "Blog deleted successfully"}


@api_router.post("/blogs/{blog_id}/publish", response_model=BlogResponse)
async def publish_blog(blog_id: str, current_user: dict = Depends(get_current_user)):
    blog = await db.blogs.find_one({"blog_id": blog_id})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog["author_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    now = datetime.now(timezone.utc).isoformat()
    await db.blogs.update_one(
        {"blog_id": blog_id},
        {"$set": {"status": "published", "published_at": now, "updated_at": now}},
    )
    updated = await db.blogs.find_one({"blog_id": blog_id}, {"_id": 0})
    return _blog_response(updated)


@api_router.post("/blogs/{blog_id}/unpublish", response_model=BlogResponse)
async def unpublish_blog(blog_id: str, current_user: dict = Depends(get_current_user)):
    blog = await db.blogs.find_one({"blog_id": blog_id})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog["author_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    now = datetime.now(timezone.utc).isoformat()
    await db.blogs.update_one(
        {"blog_id": blog_id},
        {"$set": {"status": "draft", "published_at": None, "updated_at": now}},
    )
    updated = await db.blogs.find_one({"blog_id": blog_id}, {"_id": 0})
    return _blog_response(updated)


# --- Comments ---

@api_router.post("/blogs/{blog_id}/comments", response_model=CommentResponse)
async def add_comment(
    blog_id: str,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user),
):
    blog = await db.blogs.find_one({"blog_id": blog_id})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    now = datetime.now(timezone.utc).isoformat()
    comment = {
        "comment_id": str(uuid.uuid4()),
        "blog_id": blog_id,
        "parent_comment_id": comment_data.parent_comment_id,
        "author_email": current_user["email"],
        "author_username": current_user["username"],
        "author_full_name": current_user["full_name"],
        "content": comment_data.content,
        "upvotes": 0,
        "created_at": now,
    }
    await db.comments.insert_one(comment)
    await db.blogs.update_one({"blog_id": blog_id}, {"$inc": {"comment_count": 1}})
    comment.pop("_id", None)
    comment["created_at"] = parse_datetime(comment["created_at"])
    return CommentResponse(**comment)


@api_router.get("/blogs/{blog_id}/comments", response_model=List[CommentResponse])
async def get_comments(blog_id: str):
    comments = (
        await db.comments.find({"blog_id": blog_id}, {"_id": 0})
        .sort("created_at", 1)
        .to_list(200)
    )
    result = []
    for c in comments:
        c["created_at"] = parse_datetime(c["created_at"])
        result.append(CommentResponse(**c))
    return result


# --- Reactions ---

@api_router.post("/blogs/{blog_id}/reactions")
async def toggle_reaction(
    blog_id: str,
    reaction_data: ReactionCreate,
    current_user: dict = Depends(get_current_user),
):
    valid_types = {"fire", "rocket", "bulb", "clap", "heart"}
    if reaction_data.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid type. Use: {valid_types}")

    existing = await db.reactions.find_one({
        "blog_id": blog_id,
        "user_email": current_user["email"],
        "type": reaction_data.type,
    })
    if existing:
        await db.reactions.delete_one({"_id": existing["_id"]})
        await db.blogs.update_one({"blog_id": blog_id}, {"$inc": {"reaction_count": -1}})
        return {"action": "removed", "type": reaction_data.type}
    else:
        await db.reactions.insert_one({
            "blog_id": blog_id,
            "user_email": current_user["email"],
            "type": reaction_data.type,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await db.blogs.update_one({"blog_id": blog_id}, {"$inc": {"reaction_count": 1}})
        return {"action": "added", "type": reaction_data.type}


@api_router.get("/blogs/{blog_id}/reactions")
async def get_reactions(blog_id: str):
    pipeline = [
        {"$match": {"blog_id": blog_id}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
    ]
    result = await db.reactions.aggregate(pipeline).to_list(10)
    return {r["_id"]: r["count"] for r in result}


# --- Bookmarks ---

@api_router.post("/blogs/{blog_id}/bookmark")
async def toggle_bookmark(
    blog_id: str,
    current_user: dict = Depends(get_current_user),
):
    existing = await db.bookmarks.find_one({
        "user_email": current_user["email"],
        "blog_id": blog_id,
    })
    if existing:
        await db.bookmarks.delete_one({"_id": existing["_id"]})
        return {"action": "removed"}
    else:
        await db.bookmarks.insert_one({
            "user_email": current_user["email"],
            "blog_id": blog_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"action": "added"}


@api_router.get("/bookmarks", response_model=List[BlogResponse])
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    bookmarks = await db.bookmarks.find(
        {"user_email": current_user["email"]}, {"_id": 0}
    ).to_list(100)
    blog_ids = [b["blog_id"] for b in bookmarks]
    blogs = await db.blogs.find({"blog_id": {"$in": blog_ids}}, {"_id": 0}).to_list(100)
    return [_blog_response(b) for b in blogs]


# ---------------------------------------------------------------------------
# Mount router
# ---------------------------------------------------------------------------

app.include_router(api_router)