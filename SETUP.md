# PostgreSQL Setup Guide

This application now uses PostgreSQL as the database. Follow these steps to set up PostgreSQL and run the application.

## Prerequisites

1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql` or download from the website
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL Service**
   - Windows: PostgreSQL should start automatically after installation
   - macOS: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

## Database Setup

### Option 1: Automatic Setup (Recommended)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the database setup script:
   ```bash
   python database.py
   ```

### Option 2: Manual Setup
1. Connect to PostgreSQL as superuser:
   ```bash
   psql -U postgres
   ```

2. Create the database:
   ```sql
   CREATE DATABASE dashboard_db;
   ```

3. Create a user (optional):
   ```sql
   CREATE USER dashboard_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;
   ```

4. Exit psql:
   ```sql
   \q
   ```

## Configuration

Update the `.env` file in the backend directory with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/dashboard_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=dashboard_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
```

## Running the Application

### Backend
```bash
cd backend
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Features

### Authentication System
- **User Registration**: Create new accounts with email and password
- **User Login**: Secure authentication with JWT tokens
- **Password Security**: Bcrypt hashing for password storage

### User Preferences
- **Food Preferences**: 
  - Favorite cuisines (Italian, Chinese, Indian, etc.)
  - Dietary restrictions (Vegetarian, Vegan, Gluten-free, etc.)
- **Movie Preferences**:
  - Favorite genres (Action, Comedy, Drama, etc.)
  - Preferred languages (English, Spanish, French, etc.)

### Application Flow
1. **Login/Signup**: Users must authenticate to access the dashboard
2. **Preferences Setup**: After signup, users set their food and movie preferences
3. **Dashboard**: Personalized content based on user preferences
4. **Settings**: Users can update their preferences anytime via the settings page

### Database Storage
- **User Data**: Stored securely in PostgreSQL with encrypted passwords
- **Preferences**: JSON-based preference storage for flexibility
- **Sessions**: JWT token management for secure authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Preferences
- `POST /api/preferences` - Save user preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences/<category>` - Update specific preference category

### Content
- `GET /api/food` - Get personalized food recommendations
- `GET /api/movies` - Get personalized movie recommendations
- `GET /api/news` - Get news (existing functionality)
- `GET /api/jobs` - Get jobs (existing functionality)

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check credentials in `.env` file
3. Verify database exists: `psql -U postgres -l`

### Authentication Issues
1. Clear browser localStorage if having login issues
2. Check JWT_SECRET_KEY in `.env` file
3. Verify backend is running on port 5000

### Frontend Issues
1. Ensure all dependencies are installed: `npm install`
2. Check that backend is running and accessible
3. Verify CORS is properly configured

## Security Notes

- Change default passwords in production
- Use strong JWT secret keys
- Enable SSL/HTTPS in production
- Regularly update dependencies
- Consider implementing rate limiting for API endpoints
