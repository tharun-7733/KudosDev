import asyncio
from database import db
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timezone

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_user():
    try:
        email = "test@test.com"
        password = "password"
        
        existing = await db.users.find_one({"email": email})
        if existing:
            print("User already exists")
            return

        user_dict = {
            "email": email,
            "password": pwd_context.hash(password),
            "full_name": "Test User",
            "username": "testuser",
            "bio": "I am a test user",
            "avatar_url": None,
            "github_url": None,
            "linkedin_url": None,
            "website_url": None,
            "location": None,
            "skills": ["React", "Python"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_dict)
        print(f"User created: {email} / {password}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_user())
