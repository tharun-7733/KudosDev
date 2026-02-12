# KudosDev

A platform for developers to showcase projects, track progress, and build credibility in public.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, Motor (async MongoDB driver) |
| Database | MongoDB |
| Auth | JWT (python-jose), bcrypt (passlib) |

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))

## Quick Start

### 1. Clone

```bash
git clone <repo-url>
cd KudosD
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env       # then edit .env with your values
```

> **Important:** Generate a strong, random `SECRET_KEY` for production.

### 3. Frontend

```bash
cd frontend
npm install

cp .env.example .env       # adjust REACT_APP_BACKEND_URL if needed
```

### 4. Run

From the project root:

```bash
npm install                # installs concurrently
npm start                  # starts both backend and frontend
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
KudosD/
├── backend/
│   ├── server.py            # FastAPI application (routes, models, auth)
│   ├── database.py          # MongoDB connection
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── context/         # React context (Auth, Theme)
│   │   ├── lib/             # API client & utilities
│   │   └── App.js           # Root component with routing
│   ├── public/
│   ├── package.json
│   └── .env.example
├── package.json             # Root scripts (concurrently)
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{username}` | Get public user profile |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/my` | List current user's projects |
| GET | `/api/projects/user/{username}` | List user's projects |
| GET | `/api/projects/{id}` | Get project by ID |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |

## License

MIT
