import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext

# Fix for passlib/bcrypt incompatibility
import bcrypt
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type('About', (object,), {'__version__': bcrypt.__version__})

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def check_users():
    ROOT_DIR = Path(__file__).parent.parent
    load_dotenv(ROOT_DIR / "backend" / ".env")
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'KudosDev')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connecting to {db_name}...")
    users = await db.users.find().to_list(10)
    
    if not users:
        print("No users found in database.")
    else:
        for u in users:
            print(f"User found: email={u.get('email')}, username={u.get('username')}")
            # Test verify_password
            if u.get('email') == 'admin@gmail.com':
                try:
                    is_valid = pwd_context.verify("admin", u['password'])
                    print(f"Password 'admin' verification: {is_valid}")
                except Exception as e:
                    print(f"Verification error: {e}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
