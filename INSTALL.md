# Installation Guide

Follow these steps to install all necessary dependencies and set up the application.

## Prerequisites

1. **Python 3.8+** - Download from https://python.org
2. **Node.js 16+** - Download from https://nodejs.org
3. **PostgreSQL** - Download from https://postgresql.org

## Step 1: Backend Dependencies

Open Command Prompt or PowerShell and navigate to the backend directory:

```bash
cd f:\hackathon_2\backend
```

Install Python dependencies:

```bash
pip install Flask==2.3.3
pip install Flask-CORS==4.0.0
pip install Flask-SQLAlchemy==3.0.5
pip install Flask-JWT-Extended==4.5.2
pip install Flask-Bcrypt==1.0.1
pip install psycopg2-binary==2.9.7
pip install requests==2.31.0
pip install python-dotenv==1.0.0
```

Or install all at once:
```bash
pip install -r requirements.txt
```

## Step 2: Frontend Dependencies

Navigate to the frontend directory:

```bash
cd f:\hackathon_2\frontend
```

Install Node.js dependencies:

```bash
npm install
```

## Step 3: PostgreSQL Setup

### Install PostgreSQL
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the 'postgres' user
4. Default port is 5432 (keep this unless you have conflicts)

### Create Database
Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE dashboard_db;
```

### Update Configuration
Edit `f:\hackathon_2\backend\.env` file and update the database credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dashboard_db
POSTGRES_PASSWORD=YOUR_PASSWORD
```

Replace `YOUR_PASSWORD` with the actual PostgreSQL password you set.

## Step 4: Initialize Database

Navigate to backend directory and run:

```bash
cd f:\hackathon_2\backend
python database.py
```

This will create all necessary database tables.

## Step 5: Start the Application

### Terminal 1 - Start Backend
```bash
cd f:\hackathon_2\backend
python app.py
```

The backend will start on http://localhost:5000

### Terminal 2 - Start Frontend
```bash
cd f:\hackathon_2\frontend
npm start
```

The frontend will start on http://localhost:3000

## Verification

1. Open http://localhost:3000 in your browser
2. You should see the login/signup page
3. Create a new account
4. Set your food and movie preferences
5. Access the personalized dashboard

## Troubleshooting

### Python Issues
- If `pip` is not recognized, try `python -m pip install ...`
- If `python` is not recognized, try `py` instead

### PostgreSQL Issues
- Ensure PostgreSQL service is running
- Check Windows Services for "postgresql" service
- Verify credentials in .env file

### Node.js Issues
- Ensure Node.js is installed: `node --version`
- Clear npm cache if needed: `npm cache clean --force`

### Port Conflicts
- Backend uses port 5000
- Frontend uses port 3000
- PostgreSQL uses port 5432
- Make sure these ports are available

## Quick Start Commands

After initial setup, use these commands to start the application:

```bash
# Backend (Terminal 1)
cd f:\hackathon_2\backend && python app.py

# Frontend (Terminal 2)  
cd f:\hackathon_2\frontend && npm start
```
