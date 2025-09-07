# OneHub - Personalized Dashboard Platform

A comprehensive, modern dashboard platform built with Python Flask backend and React frontend. OneHub aggregates content from multiple sources and provides personalized experiences through user preferences, authentication, and a beautiful dark-themed interface.

## 🚀 Key Features

### 📰 Content Aggregation
- **News**: Latest headlines from NewsAPI with personalized category filtering
- **Jobs**: Curated job opportunities from Internshala and other sources
- **Videos**: Trending YouTube content based on user preferences
- **Movies**: Popular and upcoming movies with detailed information
- **Reddit**: Personalized subreddit content based on user interests
- **Weather**: Multi-city weather dashboard with location management
- **Cryptocurrency**: Real-time crypto prices and market data
- **Recipes**: Categorized recipe finder with detailed nutritional information

### 👤 User Management
- **JWT Authentication**: Secure user registration and login system
- **User Profiles**: Personalized user information and preferences
- **Preference Management**: Customizable content categories and interests
- **Settings Dashboard**: Comprehensive user settings and profile management

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark color scheme with consistent styling
- **Inter Font**: Modern typography throughout the application
- **Responsive Design**: Optimized for desktop and mobile devices
- **Uniform Cards**: Consistent card sizing and layout across all sections
- **Smooth Animations**: Subtle hover effects and transitions

### 🔧 Technical Features
- **MongoDB Integration**: User data persistence and preference storage
- **Real API Integration**: Multiple external service integrations
- **Mock Data Fallback**: Graceful degradation when API keys are unavailable
- **CORS Enabled**: Seamless frontend-backend communication
- **Error Handling**: Comprehensive error management and user feedback

## 🏗️ Architecture

### Backend (Python Flask)
- **Flask API Server** (Port 5000): RESTful API serving all endpoints
- **MongoDB Database**: User authentication, preferences, and data storage
- **JWT Authentication**: Secure token-based authentication system
- **External API Integration**: NewsAPI, YouTube, OpenWeatherMap, CoinGecko, Spoonacular
- **Mock Data Services**: Fallback data when external APIs are unavailable

### Frontend (React)
- **Modern React App** (Port 3000): Component-based architecture
- **Styled Components**: CSS-in-JS styling with consistent theming
- **React Router**: Client-side routing for multi-page navigation
- **API Service Layer**: Centralized API communication
- **Responsive Design**: Mobile-first responsive layout

## 📋 Prerequisites

- **Python 3.8+**: Backend runtime environment
- **Node.js 16+**: Frontend development environment
- **MongoDB**: Database for user data (local or cloud)
- **npm/yarn**: Package manager for frontend dependencies
- **API Keys**: External service keys (optional - mock data available)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd OneHub
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

### 4. Environment Configuration
Create `env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/onehub

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here

# External API Keys (Optional)
NEWS_API_KEY=your-newsapi-key
YOUTUBE_API_KEY=your-youtube-api-key
OPENWEATHER_API_KEY=your-openweather-key
SPOONACULAR_API_KEY=your-spoonacular-key

# Service URLs
INTERNSHALA_SCRAPER_URL=http://localhost:8000
```

### 5. Database Setup
Ensure MongoDB is running locally or configure cloud MongoDB URI in environment variables.

## 🚀 Running the Application

### Quick Start (Recommended)
```bash
python start_app.py
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
- **API Documentation**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/health

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user info
- `PUT /api/auth/user` - Update user profile

### Content Services
- `GET /api/news` - Personalized news articles
- `GET /api/news/public` - Public news (no auth required)
- `GET /api/jobs` - Job listings
- `GET /api/videos` - Personalized YouTube videos
- `GET /api/movies` - Popular and upcoming movies
- `GET /api/reddit` - Personalized Reddit content
- `GET /api/weather` - Multi-city weather data
- `GET /api/crypto` - Cryptocurrency prices
- `GET /api/recipes` - Recipe search and recommendations

### User Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences
- `POST /api/preferences/setup` - Initial preference setup

## 📱 Usage Guide

### Getting Started
1. **Registration**: Create a new account or login with existing credentials
2. **Onboarding**: Complete the initial preference setup for personalized content
3. **Dashboard**: Access the main dashboard with all content sections
4. **Personalization**: Customize preferences in the Settings page

### Navigation
- **Dashboard**: Main hub with all content sections
- **Individual Pages**: Dedicated pages for News, Jobs, Videos, Movies, Reddit, Weather, Crypto, and Recipes
- **Settings**: User profile and preference management
- **Back Navigation**: Easy navigation between pages

### Content Interaction
- **Clickable Cards**: All dashboard sections are clickable for detailed views
- **Personalized Content**: Content filtered based on user preferences
- **Real-time Updates**: Fresh data on each page load
- **External Links**: Direct links to original content sources

## 🛠️ Development

### Project Structure
```
OneHub/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── auth.py               # Authentication logic
│   ├── database.py           # MongoDB operations
│   ├── requirements.txt      # Python dependencies
│   └── test_*.py            # Test files
├── frontend/
│   ├── public/
│   │   ├── index.html       # HTML template
│   │   └── manifest.json    # PWA configuration
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js       # API service layer
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.js # Main dashboard
│   │   │   ├── Auth.js      # Authentication
│   │   │   ├── Header.js    # Navigation header
│   │   │   ├── Settings.js  # User settings
│   │   │   └── *Page.js     # Individual content pages
│   │   ├── utils/           # Utility functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # React entry point
│   ├── package.json        # Node dependencies
│   └── Dockerfile          # Docker configuration
├── env.local               # Environment variables
├── start_app.py           # Application launcher
├── README.md              # This file
├── SETUP.md              # Setup instructions
├── INSTALL.md            # Installation guide
└── QUICK_START.md        # Quick start guide
```

### Technology Stack
- **Backend**: Python, Flask, MongoDB, JWT, Requests
- **Frontend**: React, Styled Components, React Router, React Icons
- **Database**: MongoDB with user collections
- **Authentication**: JWT tokens with secure storage
- **Styling**: Styled Components with dark theme
- **APIs**: NewsAPI, YouTube, OpenWeatherMap, CoinGecko, Spoonacular

### Adding New Features
1. **Backend Endpoint**: Add new route in `backend/app.py`
2. **Database Model**: Update `database.py` for new data structures
3. **Frontend Service**: Add API method in `src/api/api.js`
4. **UI Component**: Create new component in `src/components/`
5. **Navigation**: Update routing in `App.js`

### Code Style Guidelines
- **Python**: Follow PEP 8 standards
- **JavaScript**: Use ES6+ features and functional components
- **Styling**: Use styled-components with consistent theming
- **Naming**: Use descriptive names for components and functions

## 🎨 Design System

### Color Palette
- **Background**: `#1a202c` (Dark blue-gray)
- **Cards**: `#2d3748` (Medium gray)
- **Content**: `#374151` (Light gray)
- **Borders**: `#4a5568` (Border gray)
- **Text Primary**: `#e2e8f0` (Light gray)
- **Text Secondary**: `#cbd5e0` (Medium light gray)
- **Text Muted**: `#a0aec0` (Muted gray)
- **Accent**: `#63b3ed` (Blue)
- **Primary**: `#4299e1` (Primary blue)

### Typography
- **Font Family**: Inter, system fonts
- **Headings**: 300-600 font weight
- **Body**: 400 font weight
- **Buttons**: 500-600 font weight

### Components
- **Cards**: Consistent height (500px), rounded corners (12px)
- **Buttons**: Blue theme with hover effects
- **Inputs**: Dark theme with blue focus states
- **Navigation**: Consistent header across all pages

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side input validation
- **Error Handling**: Secure error messages without sensitive data exposure

## 🚀 Deployment

### Local Development
```bash
python start_app.py
```

### Production Deployment
1. **Environment Variables**: Configure production environment variables
2. **Database**: Set up production MongoDB instance
3. **API Keys**: Configure all external service API keys
4. **Build Frontend**: `npm run build` in frontend directory
5. **Serve**: Use production WSGI server like Gunicorn

### Docker Deployment
```bash
# Build and run with Docker
docker build -t onehub .
docker run -p 3000:3000 -p 5000:5000 onehub
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest test_*.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
curl -X GET http://localhost:5000/health
```

## 🔮 Future Enhancements

### Planned Features
- [ ] **Real-time Notifications**: Push notifications for new content
- [ ] **Advanced Search**: Global search across all content types
- [ ] **Data Analytics**: User engagement and content analytics
- [ ] **Mobile App**: React Native mobile application
- [ ] **Social Features**: User interactions and content sharing
- [ ] **AI Recommendations**: Machine learning-based content suggestions
- [ ] **Offline Support**: PWA with offline content caching
- [ ] **Multi-language**: Internationalization support

### Technical Improvements
- [ ] **Performance Optimization**: Caching and lazy loading
- [ ] **Database Optimization**: Indexing and query optimization
- [ ] **API Rate Limiting**: Request throttling and quota management
- [ ] **Monitoring**: Application performance monitoring
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Documentation**: API documentation with Swagger

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure backward compatibility
- Write clear commit messages

## 📊 Performance

### Metrics
- **Load Time**: < 2 seconds for dashboard
- **API Response**: < 500ms for most endpoints
- **Bundle Size**: Optimized React bundle
- **Database Queries**: Indexed MongoDB operations

### Optimization
- **Frontend**: Code splitting and lazy loading
- **Backend**: Efficient database queries and caching
- **Assets**: Optimized images and fonts
- **Network**: Compressed responses and CDN usage

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **API Keys**: Check environment variables for external services
3. **Port Conflicts**: Ensure ports 3000 and 5000 are available
4. **CORS Issues**: Verify CORS configuration in Flask app
5. **Build Errors**: Clear node_modules and reinstall dependencies

### Debug Mode
Enable debug mode for detailed error messages:
```bash
export FLASK_DEBUG=1
python app.py
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **External APIs**: NewsAPI, YouTube, OpenWeatherMap, CoinGecko, Spoonacular
- **UI Libraries**: React, Styled Components, React Icons
- **Database**: MongoDB for reliable data storage
- **Authentication**: JWT for secure user sessions

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**OneHub** - Your personalized dashboard for everything that matters. 🚀
