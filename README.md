# OneHub - Personalized Dashboard Platform

A comprehensive, modern dashboard platform built with Python Flask backend and React frontend. OneHub aggregates content from multiple sources and provides personalized experiences through user preferences, authentication, and a beautiful dark-themed interface with lazy loading for optimal performance.

## 🚀 Key Features

### 📰 Content Aggregation
- **News**: Latest headlines from GNews API with personalized category filtering
- **Jobs**: Curated job opportunities from Internshala CSV data with smart filtering
- **Videos**: Trending YouTube content based on user preferences with fallback mock data
- **Movies**: Popular and upcoming movies from TMDB API with genre filtering
- **Reddit**: Personalized subreddit content with OAuth authentication
- **Weather**: Multi-city weather dashboard with OpenWeatherMap and wttr.in fallback
- **Cryptocurrency**: Real-time crypto prices from CoinGecko API
- **Recipes**: Recipe finder using TheMealDB API with dietary preferences
- **Blockchain & NFTs**: Complete NFT marketplace with Verbwire integration for minting, transferring, and managing digital assets

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
- **Lazy Loading**: APIs only called when specific cards are clicked for optimal performance
- **Back Navigation**: Seamless navigation between dashboard and individual pages

### 🔧 Technical Features
- **MongoDB Integration**: User data persistence and preference storage with indexes
- **Real API Integration**: Multiple external service integrations with fallback systems
- **Mock Data Fallback**: Graceful degradation when API keys are unavailable
- **CORS Enabled**: Seamless frontend-backend communication
- **Error Handling**: Comprehensive error management and user feedback
- **Blockchain Integration**: Complete NFT marketplace with Verbwire API
- **Performance Optimization**: Lazy loading and efficient API usage

## 🏗️ Architecture

### Backend (Python Flask)
- **Flask API Server** (Port 5000): RESTful API serving all endpoints
- **MongoDB Database**: User authentication, preferences, and blockchain data storage
- **JWT Authentication**: Secure token-based authentication system
- **External API Integration**: GNews, YouTube, OpenWeatherMap, CoinGecko, TheMealDB, TMDB, Verbwire
- **Mock Data Services**: Fallback data when external APIs are unavailable
- **Blockchain Module**: NFT minting, transferring, and collection management
- **CSV Data Processing**: Internshala jobs data with pandas integration

### Frontend (React)
- **Modern React App** (Port 3000): Component-based architecture
- **Styled Components**: CSS-in-JS styling with consistent theming
- **React Router**: Client-side routing for multi-page navigation
- **API Service Layer**: Centralized API communication with lazy loading
- **Responsive Design**: Mobile-first responsive layout
- **Individual Page Components**: Dedicated pages for each content type
- **Blockchain UI**: Complete NFT marketplace interface

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
NEWS_API_KEY=your-gnews-api-key
YOUTUBE_API_KEY=your-youtube-api-key
OPENWEATHER_API_KEY=your-openweather-key
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_SECRET=your-reddit-secret

# Blockchain API Keys (Optional)
VERBWIRE_SECRET_KEY=your-verbwire-secret-key
VERBWIRE_PUBLIC_KEY=your-verbwire-public-key

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
- `GET /api/auth/me` - Get current user info
- `PUT /api/user/update-name` - Update user name

### Content Services
- `GET /api/news` - Personalized news articles (JWT required)
- `GET /api/news/public` - Public news (no auth required)
- `GET /api/news/trending` - Trending news across categories
- `GET /api/news/search?q=query` - Search news articles
- `GET /api/jobs` - Job listings with category filtering (JWT required)
- `GET /api/videos` - Personalized YouTube videos (JWT required)
- `GET /api/movies/popular` - Popular movies with genre filtering (JWT required)
- `GET /api/movies/upcoming` - Upcoming movies (JWT required)
- `GET /api/reddit` - Personalized Reddit content (JWT required)
- `GET /api/reddit/trending` - Trending Reddit posts
- `GET /api/weather?city=name` - Weather data with forecast (JWT required)
- `GET /api/crypto` - Cryptocurrency prices and market data (JWT required)
- `GET /api/recipes?query=search` - Recipe search and recommendations (JWT required)

### Blockchain & NFTs
- `GET /api/blockchain/health` - Blockchain service health check
- `POST /api/blockchain/mintNFT` - Mint new NFT (JWT required)
- `POST /api/blockchain/transferNFT` - Transfer NFT ownership (JWT required)
- `GET /api/blockchain/getNFTs` - Get user's NFTs (JWT required)
- `GET /api/blockchain/getNFT/<nft_id>` - Get specific NFT details (JWT required)
- `GET /api/blockchain/getTransactions` - Get NFT transactions (JWT required)
- `GET /api/blockchain/getCollections` - Get NFT collections (JWT required)
- `POST /api/blockchain/deployContract` - Deploy new NFT contract (JWT required)
- `GET /api/blockchain/stats` - Get blockchain statistics (JWT required)

### User Preferences
- `GET /api/preferences` - Get user preferences (JWT required)
- `POST /api/preferences` - Save user preferences (JWT required)
- `PUT /api/preferences/<category>` - Update specific category preferences (JWT required)

## 📱 Usage Guide

### Getting Started
1. **Registration**: Create a new account or login with existing credentials
2. **Onboarding**: Complete the initial preference setup for personalized content
3. **Dashboard**: Access the main dashboard with all content sections
4. **Personalization**: Customize preferences in the Settings page

### Navigation
- **Dashboard**: Main hub with all content sections (lazy loading - APIs called only when cards are clicked)
- **Individual Pages**: Dedicated pages for News, Jobs, Videos, Movies, Reddit, Weather, Crypto, Recipes, and Blockchain/NFTs
- **Settings**: User profile and preference management
- **Back Navigation**: Easy navigation between pages with back buttons on all pages

### Content Interaction
- **Clickable Cards**: All dashboard sections are clickable for detailed views
- **Lazy Loading**: APIs only called when specific cards are clicked for optimal performance
- **Personalized Content**: Content filtered based on user preferences stored in MongoDB
- **Real-time Updates**: Fresh data on each page load with fallback to mock data
- **External Links**: Direct links to original content sources
- **NFT Marketplace**: Complete blockchain functionality for minting, transferring, and managing NFTs

## 🛠️ Development

### Project Structure
```
OneHub/
├── backend/
│   ├── app.py                 # Main Flask application with all endpoints
│   ├── auth.py               # Authentication logic and JWT handling
│   ├── database.py           # MongoDB operations and models
│   ├── blockchain_routes.py  # Blockchain/NFT API endpoints
│   ├── blockchain_models.py  # NFT, Transaction, Collection models
│   ├── verbwire_service.py   # Verbwire API integration service
│   ├── internshala_jobs_fully_cleaned_final.csv # Jobs data
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
│   │   │   ├── Dashboard.js # Main dashboard with lazy loading
│   │   │   ├── Auth.js      # Authentication forms
│   │   │   ├── Header.js    # Navigation header
│   │   │   ├── Settings.js  # User settings and preferences
│   │   │   ├── NewsPage.js  # News content page
│   │   │   ├── JobsPage.js  # Jobs listings page
│   │   │   ├── VideosPage.js # YouTube videos page
│   │   │   ├── MoviesPage.js # Movies content page
│   │   │   ├── RedditPage.js # Reddit posts page
│   │   │   ├── WeatherPage.js # Weather dashboard
│   │   │   ├── CryptoPage.js # Cryptocurrency page
│   │   │   ├── RecipesPage.js # Recipes finder page
│   │   │   ├── BlockchainPage.js # NFT marketplace page
│   │   │   └── BlockchainPage.css # Blockchain page styles
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
- **Backend**: Python, Flask, MongoDB, JWT, Requests, Pandas
- **Frontend**: React, Styled Components, React Router, React Icons
- **Database**: MongoDB with user collections and blockchain data
- **Authentication**: JWT tokens with secure storage
- **Styling**: Styled Components with dark theme
- **APIs**: GNews, YouTube, OpenWeatherMap, CoinGecko, TheMealDB, TMDB, Reddit, Verbwire
- **Blockchain**: Verbwire API for NFT operations on Sepolia testnet
- **Data Processing**: Pandas for CSV job data processing

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
- [ ] **NFT Marketplace Expansion**: Buy/sell NFTs, auction system, royalty management
- [ ] **Multi-Chain Support**: Polygon, Binance Smart Chain integration
- [ ] **Wallet Integration**: MetaMask, WalletConnect support
- [ ] **Real-time Notifications**: Push notifications for new content and NFT activities
- [ ] **Advanced Search**: Global search across all content types
- [ ] **Data Analytics**: User engagement and content analytics
- [ ] **Mobile App**: React Native mobile application
- [ ] **Social Features**: User interactions and content sharing
- [ ] **AI Recommendations**: Machine learning-based content suggestions
- [ ] **Offline Support**: PWA with offline content caching
- [ ] **Multi-language**: Internationalization support

### Technical Improvements
- [x] **Performance Optimization**: Lazy loading implemented
- [ ] **Database Optimization**: Advanced indexing and query optimization
- [ ] **API Rate Limiting**: Request throttling and quota management
- [ ] **Monitoring**: Application performance monitoring
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Documentation**: API documentation with Swagger
- [ ] **Blockchain Security**: Enhanced smart contract security and auditing

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
