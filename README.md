# Personalized Dashboard

A modern, personalized dashboard built with Python Flask backend and React frontend. Aggregates content from multiple sources including news, jobs, videos, deals, and personalized recommendations.

## 🚀 Features

- **News Aggregation**: Latest headlines from NewsAPI with category filtering
- **Job Listings**: Curated job opportunities from multiple sources
- **Video Content**: Trending videos from YouTube API
- **Deal Finder**: Best deals and offers aggregation
- **Personalized Recommendations**: AI-powered content suggestions based on user preferences

## 🏗️ Architecture

### Backend (Python Flask)
- **Flask API Server** (Port 5000): Single backend serving all endpoints
- **CORS Enabled**: Seamless integration with React frontend
- **Real API Integration**: NewsAPI, YouTube, and other external services
- **Mock Data Fallback**: Graceful degradation when API keys are unavailable

### Frontend (React)
- **Modern Dashboard** (Port 3000): Responsive, interactive UI
- **Real-time Data**: Live updates from Flask backend
- **Clean Design**: Glassmorphism UI with smooth animations

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- API Keys for external services (optional - mock data available)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hackathon_2
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Environment Variables (Optional)
The backend includes your API keys in `.env` file. Services will use mock data if keys are missing.

## 🚀 Running the Application

### Quick Start (Recommended)
```powershell
.\start_flask_app.ps1
```

### Manual Setup
```bash
# Terminal 1 - Flask Backend
cd backend
python app.py

# Terminal 2 - React Frontend
cd frontend
npm start
```

## 🌐 Access Points

- **React Frontend**: http://localhost:3000
- **Flask Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔑 API Endpoints

- `GET /api/news` - Latest news articles
- `GET /api/jobs` - Job listings
- `GET /api/videos` - Trending videos
- `GET /api/deals` - Current deals
- `GET /api/recommendations` - Personalized recommendations
- `GET /health` - Backend health status

## 📱 Usage

1. **Start the Application**: Run the startup script or manual commands
2. **Access Dashboard**: Open http://localhost:3000
3. **Explore Content**: Click "Load" buttons to fetch data from different services
4. **Real-time Updates**: Data is fetched fresh from APIs or mock sources

## 🛠️ Development

### Project Structure
```
hackathon_2/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # API keys
├── frontend/
│   ├── src/
│   │   ├── api/api.js     # API service layer
│   │   ├── components/    # React components
│   │   └── App.js         # Main app component
│   └── package.json       # Node dependencies
└── start_flask_app.ps1    # Startup script
```

### Adding New Features
1. **Backend**: Add new endpoints in `backend/app.py`
2. **Frontend**: Create new API methods in `src/api/api.js`
3. **UI**: Add components in `src/components/`

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Advanced filtering and search
- [ ] Data persistence with database
- [ ] Mobile responsive improvements
- [ ] Real-time notifications
- [ ] More content source integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
