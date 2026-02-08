import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def test_verification():
    try:
        client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        db = client[os.environ['DB_NAME']]
        
        user = await db.users.find_one({"email": "test@test.com"})
        if not user:
            print("User not found")
            return
            
        password = "password"
        hashed = user["password"]
        
        print(f"Hashed from DB: {hashed}")
        is_correct = pwd_context.verify(password, hashed)
        print(f"Verification result: {is_correct}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_verification())
