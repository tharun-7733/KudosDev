# MongoDB Database Details (KudosDev)

The application is connected to a local MongoDB instance.

## Connection Details
- **Instance**: `mongodb://localhost:27017`
- **Database Name**: `KudosDev`

## Admin User (Temporary/Demo)
- **Email**: `admin@gmail.com`
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

## Database Verification
You can check the database manually using `mongosh`:
```bash
mongosh KudosDev
db.users.find()
```

> [!NOTE]
> The login page now includes a "Demo Admin Login" button for quick access during development.
