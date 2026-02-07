# KudosDev - Developer Portfolio Platform

A modern platform for developers to showcase their projects, track their progress, and build credibility in public.

## 🚀 Tech Stack

### Frontend
- **React** - UI Framework
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Sonner** - Toast Notifications

### Backend
- **FastAPI** - Python Web Framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Motor** - Async MongoDB Driver

## 📦 Project Structure

```
KudosD/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── lib/          # Utilities & API client
│   │   └── App.js        # Main app component
│   └── package.json
├── backend/           # FastAPI application
│   ├── server.py         # Main server file
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Environment variables
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=kudosdev_db
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key-here-change-in-production
```

5. Start MongoDB:
```bash
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongod  # Linux
```

6. Run the server:
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at http://localhost:8000
API Docs at http://localhost:8000/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

4. Start development server:
```bash
npm start
```

Frontend will be available at http://localhost:3000

## 📖 Features

- ✅ User authentication (Register/Login)
- ✅ JWT-based authorization
- ✅ Protected routes
- ✅ User dashboard
- ✅ Project management (CRUD operations)
- ✅ Responsive design
- ✅ Light mode interface
- ✅ Professional UI/UX

## 🎨 Design System

KudosDev follows a clean, professional design aesthetic:
- **Light theme** with subtle accents
- **Typography**: Space Grotesk (headings), Inter (body), JetBrains Mono (code)
- **Colors**: White backgrounds, dark text, blue accents

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user

### Users
- `GET /api/users/{username}` - Get user by username

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all projects
- `GET /api/projects/my` - Get user's projects
- `GET /api/projects/{id}` - Get project by ID
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

## 🚀 Deployment

### Backend
Deploy to services like:
- Render
- Railway
- Heroku
- DigitalOcean

### Frontend
Deploy to:
- Vercel
- Netlify
- GitHub Pages

### Database
Use MongoDB Atlas for cloud database

## 📝 License

MIT License

## 👨‍💻 Author

Built with ♥ by developers, for developers who build in public.
