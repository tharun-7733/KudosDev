import asyncio
from database import db
from dotenv import load_dotenv

load_dotenv()

async def check():
    try:
        users = await db.users.find().to_list(10)
        print(f"Users found: {len(users)}")
        for u in users:
            print(f"Email: {u.get('email')}, Username: {u.get('username')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
