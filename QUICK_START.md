# Quick Start Guide

I've made all the necessary configuration changes to make the app work seamlessly! Here's how to start:

## 🚀 Easy Setup (No PostgreSQL Required)

The app now automatically uses SQLite if PostgreSQL isn't available, so you can start immediately:

### 1. Install Backend Dependencies
```bash
cd f:\hackathon_2\backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies  
```bash
cd f:\hackathon_2\frontend
npm install
```

### 3. Start the Application

**Option A: Use the Smart Starter (Recommended)**
```bash
cd f:\hackathon_2
python start_app.py
```

**Option B: Manual Start**
```bash
# Terminal 1 - Backend
cd f:\hackathon_2\backend
python app.py

# Terminal 2 - Frontend  
cd f:\hackathon_2\frontend
npm start
```

## 🎯 What I Changed

✅ **Auto-Database Detection**: App automatically uses SQLite if PostgreSQL isn't installed
✅ **Smart Configuration**: No manual database URL changes needed
✅ **Simplified Requirements**: Removed PostgreSQL dependency from main requirements
✅ **Smart Starter Script**: `start_app.py` handles database setup automatically
✅ **Fallback System**: Works with SQLite out of the box

## 🌐 Access Points

- **Frontend**: http://localhost:3000 (Login/Signup page)
- **Backend**: http://localhost:5000 (API endpoints)

## 🔧 Optional PostgreSQL Setup

If you want PostgreSQL later:

1. Install PostgreSQL
2. Install: `pip install psycopg2-binary`
3. Uncomment database lines in `.env` file
4. Update password in `.env`
5. Restart the app

## ✨ Features Ready

- ✅ User Registration/Login
- ✅ Food Preferences (Cuisines, Dietary)
- ✅ Movie Preferences (Genres, Languages)  
- ✅ Settings Page for Updates
- ✅ Personalized Dashboard
- ✅ Secure JWT Authentication

The app is now ready to run with minimal setup!
