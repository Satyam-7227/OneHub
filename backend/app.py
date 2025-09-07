from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import requests
import os
import time
import json
from datetime import datetime
from dotenv import load_dotenv

# Helper function to format recipe data
def format_recipe(meal, user_dietary, is_vegetarian):
    # Extract ingredients with proper formatting
    ingredients = []
    for i in range(1, 21):
        ingredient = meal.get(f'strIngredient{i}')
        measure = meal.get(f'strMeasure{i}')
        if ingredient and ingredient.strip():
            if measure and measure.strip() and measure.strip() != ' ':
                ingredients.append(f"{measure.strip()} {ingredient.strip()}")
            else:
                ingredients.append(ingredient.strip())
    
    # Determine dietary tags
    meal_category = meal.get('strCategory', '').lower()
    dietary_tags = []
    if is_vegetarian or 'vegetarian' in meal_category:
        dietary_tags.append('Vegetarian')
    if meal_category and meal_category != 'miscellaneous':
        dietary_tags.append(meal_category.title())
    
    # Add user dietary preferences
    for diet in user_dietary:
        if diet.lower() not in [tag.lower() for tag in dietary_tags]:
            dietary_tags.append(diet.title())
    
    # Calculate cooking time based on instructions
    meal_instructions = meal.get('strInstructions', '')
    estimated_time = 30
    if meal_instructions:
        instruction_length = len(meal_instructions)
        if instruction_length > 1000:
            estimated_time = 60
        elif instruction_length > 500:
            estimated_time = 45
        elif instruction_length < 200:
            estimated_time = 20
    
    # Calculate nutrition estimates
    protein_ingredients = len([i for i in ingredients if any(p in i.lower() for p in ['egg', 'meat', 'fish', 'bean', 'lentil', 'chicken', 'tofu', 'cheese'])])
    carb_ingredients = len([i for i in ingredients if any(c in i.lower() for c in ['flour', 'rice', 'pasta', 'bread', 'potato', 'oat'])])
    fat_ingredients = len([i for i in ingredients if any(f in i.lower() for f in ['oil', 'butter', 'cream', 'cheese', 'nut', 'avocado'])])
    
    return {
        "id": meal['idMeal'],
        "title": meal['strMeal'],
        "image": meal['strMealThumb'],
        "ready_in_minutes": estimated_time,
        "servings": 4,
        "cuisine": [meal.get('strArea', 'International')],
        "dietary": dietary_tags,
        "ingredients": ingredients[:12],
        "instructions": meal_instructions or 'Instructions not available for this recipe.',
        "source_url": meal.get('strSource', ''),
        "nutrition": {
            "calories": 300 + (len(ingredients) * 15),
            "protein": f"{15 + (protein_ingredients * 8)}g",
            "carbs": f"{30 + (carb_ingredients * 12)}g",
            "fat": f"{10 + (fat_ingredients * 4)}g"
        }
    }

# Import MongoDB models and auth
from database import mongo, User, UserPreference, RecipeRequest
from auth import create_user_token, register_user, authenticate_user, get_current_user

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'hackathon-dashboard-secret-key-2024')
from datetime import timedelta
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/dashboard_db')

# Initialize extensions
mongo.init_app(app)
jwt = JWTManager(app)

# Configuration
# NEWS_API_KEY = os.getenv('NEWS_API_KEY', '46575fbd9144430bb7dce528004ec99e')
NEWS_API_KEY = os.getenv('NEWS_API_KEY', '4ba37a2e57c19ca6470259402b2b9b14')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', 'AIzaSyDBGtdTras52CsvF5X8QEk6vpM9vhiQYxo')
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID', 'aWGR_XGyaWsFm2MXrY_X-Q')
REDDIT_SECRET = os.getenv('REDDIT_SECRET', 'zXUAt78OltVuLnymF2qc-bDkCWEZyA')
ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', 'your_adzuna_app_id_here')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', 'your_adzuna_app_key_here')

# New Feature API Keys
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', 'your_openweather_api_key_here')
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY', 'your_spoonacular_api_key_here')

# MongoDB initialization
def init_mongodb():
    try:
        # MongoDB doesn't need table creation like SQL databases
        print("MongoDB connection initialized!")
    except Exception as e:
        print(f"Error initializing MongoDB: {e}")

# Initialize MongoDB when app starts
with app.app_context():
    init_mongodb()

# Database initialization endpoint for setup
@app.route('/api/init-db', methods=['POST'])
def init_database():
    try:
        # Test MongoDB connection
        if mongo.client:
            mongo.client.admin.command('ping')
            return jsonify({'message': 'MongoDB initialized successfully'}), 200
        else:
            return jsonify({'message': 'MongoDB connection not available'}), 500
    except Exception as e:
        return jsonify({'message': f'Database initialization failed: {str(e)}'}), 500

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'message': 'Email, password, and name are required'}), 400
        
        user, error = register_user(email, password, name)
        if error:
            return jsonify({'message': error}), 400
        
        token = create_user_token(user)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        user, error = authenticate_user(email, password)
        if error:
            return jsonify({'message': error}), 401
        
        token = create_user_token(user)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user_info():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get user preferences
        preferences = {}
        user_prefs = UserPreference.find_by_user_id(current_user.get_id())
        for pref in user_prefs:
            preferences[pref.category] = pref.preferences
        
        user_data = {
            'id': current_user.get_id(),
            'email': current_user.email,
            'name': current_user.name,
            'created_at': current_user.created_at.isoformat() if current_user.created_at else None,
            'updated_at': current_user.updated_at.isoformat() if current_user.updated_at else None,
            'is_active': current_user.is_active
        }
        user_data['preferences'] = preferences
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# User preferences endpoints
@app.route('/api/preferences', methods=['POST'])
@jwt_required()
def save_preferences():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        for category, prefs in data.items():
            # Find existing preference or create new one
            user_pref = UserPreference.find_by_user_and_category(
                current_user.get_id(), 
                category
            )
            
            if user_pref:
                user_pref.preferences = prefs
                user_pref.updated_at = datetime.utcnow()
                user_pref.save()
            else:
                user_pref = UserPreference(
                    user_id=current_user.get_id(),
                    category=category,
                    preferences=prefs
                )
                user_pref.save()
        
        return jsonify({'message': 'Preferences saved successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        preferences = {}
        user_prefs = UserPreference.find_by_user_id(current_user.get_id())
        for pref in user_prefs:
            preferences[pref.category] = pref.preferences
        
        return jsonify({'preferences': preferences}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/preferences/<category>', methods=['PUT'])
@jwt_required()
def update_preference_category(category):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        user_pref = UserPreference.find_by_user_and_category(
            current_user.get_id(), 
            category
        )
        
        if user_pref:
            user_pref.preferences = data
            user_pref.updated_at = datetime.utcnow()
            user_pref.save()
        else:
            user_pref = UserPreference(
                user_id=current_user.get_id(),
                category=category,
                preferences=data
            )
            user_pref.save()
        
        return jsonify({'message': f'{category} preferences updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Food and Movie specific endpoints
@app.route('/api/food')
@jwt_required()
def get_food_recommendations():
    try:
        current_user = get_current_user()
        food_prefs = UserPreference.find_by_user_and_category(
            current_user.get_id(), 
            'food'
        )
        
        user_food_prefs = food_prefs.preferences if food_prefs else {}
        cuisines = user_food_prefs.get('cuisines', ['italian', 'chinese'])
        dietary = user_food_prefs.get('dietary', [])
        
        # Mock food recommendations based on preferences
        food_items = [
            {
                "id": f"food_{int(time.time())}",
                "name": f"Recommended {cuisines[0].title()} Dish",
                "description": f"Delicious {cuisines[0]} cuisine tailored to your preferences",
                "cuisine": cuisines[0],
                "rating": 4.5,
                "price": "$15-25",
                "image_url": "https://via.placeholder.com/300x200",
                "restaurant": "Local Restaurant",
                "dietary_info": dietary
            },
            {
                "id": f"food_{int(time.time())}_2",
                "name": f"Popular {cuisines[-1].title()} Special",
                "description": f"Trending {cuisines[-1]} dish in your area",
                "cuisine": cuisines[-1],
                "rating": 4.2,
                "price": "$12-20",
                "image_url": "https://via.placeholder.com/300x200",
                "restaurant": "Favorite Spot",
                "dietary_info": dietary
            }
        ]
        
        return jsonify({
            'preferences': user_food_prefs,
            'count': len(food_items),
            'recommendations': food_items
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/movies')
@jwt_required()
def get_movie_recommendations():
    try:
        current_user = get_current_user()
        movie_prefs = UserPreference.find_by_user_and_category(
            current_user.get_id(), 
            'movies'
        )
        
        user_movie_prefs = movie_prefs.preferences if movie_prefs else {}
        genres = user_movie_prefs.get('genres', ['action', 'comedy'])
        languages = user_movie_prefs.get('languages', ['english'])
        
        # Mock movie recommendations based on preferences
        movies = [
            {
                "id": f"movie_{int(time.time())}",
                "title": f"Latest {genres[0].title()} Blockbuster",
                "description": f"Exciting {genres[0]} movie perfect for your taste",
                "genre": genres[0],
                "rating": 8.2,
                "year": 2024,
                "duration": "2h 15m",
                "language": languages[0],
                "poster_url": "https://via.placeholder.com/300x450",
                "trailer_url": "https://youtube.com/watch?v=example"
            },
            {
                "id": f"movie_{int(time.time())}_2",
                "title": f"Trending {genres[-1].title()} Hit",
                "description": f"Popular {genres[-1]} film everyone's talking about",
                "genre": genres[-1],
                "rating": 7.8,
                "year": 2024,
                "duration": "1h 45m",
                "language": languages[0],
                "poster_url": "https://via.placeholder.com/300x450",
                "trailer_url": "https://youtube.com/watch?v=example2"
            }
        ]
        
        return jsonify({
            'preferences': user_movie_prefs,
            'count': len(movies),
            'recommendations': movies
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Health check endpoint
@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "dashboard-backend"})

# News Service Endpoints
@app.route('/api/news')
@jwt_required()
def get_news():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        # Get user's news preferences
        news_prefs = UserPreference.find_by_user_and_category(current_user.get_id(), 'news')
        user_categories = news_prefs.preferences.get('categories', ['general']) if news_prefs else ['general']
        
        # Debug logging
        print(f"DEBUG: User ID: {current_user.get_id()}")
        print(f"DEBUG: News preferences found: {news_prefs is not None}")
        if news_prefs:
            print(f"DEBUG: User categories: {user_categories}")
        else:
            print("DEBUG: No news preferences found, using default")
        
        # Use user's preferred category or fallback to general
        # category = request.args.get('category', user_categories[0] if user_categories else 'general')
        # print(f"DEBUG: Selected category: {category}")
        
        if not NEWS_API_KEY or NEWS_API_KEY == 'your_newsapi_key_here':
            # Return mock data
            articles = [
                {
                    "id": f"news_{int(time.time())}",
                    "title": f"⚠️ MOCK DATA: Latest {user_categories[0].title()} News",
                    "description": f"This is mock data for {user_categories[0]}. Add NEWS_API_KEY to get real news.",
                    "url": "https://newsapi.org/register",
                    "source": "Mock Data - Add API Key",
                    "category": user_categories[0],
                    "published_at": datetime.now().isoformat(),
                    "image_url": "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=MOCK+DATA",
                    "is_static": True
                }
            ]
            response_data = {
                "category": user_categories[0],
                "count": len(articles),
                "articles": articles,
                "message": "Add NEWS_API_KEY to get real data",
                "user_preferences": user_categories,
                "is_mock": True
            }
            print(f"DEBUG: Returning mock data for category: {user_categories[0]}")
            return jsonify(response_data)
        
        # Real NewsAPI call
        # url = f"https://newsapi.org/v2/top-headlines?category={category}&apiKey={NEWS_API_KEY}&pageSize=20"
        articles = []
        for cat in user_categories:
            url = f"https://gnews.io/api/v4/top-headlines?category={cat}&lang=en&apikey={NEWS_API_KEY}&max=10"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                for article in data.get('articles', []):
                    articles.append({
                        "id": f"news_{int(time.time())}_{len(articles)}",
                        "title": article.get('title', ''),
                        "description": article.get('description', ''),
                        "url": article.get('url', ''),
                        "source": article.get('source', {}).get('name', ''),
                        "category": cat,
                        "published_at": article.get('publishedAt', ''),
                        "image_url": article.get('image', ''),
                        "is_static": False
                    })
                
            else:
                raise Exception(f"API returned status {response.status_code}")
        
        response_data = {
                "category": user_categories,
                "count": len(articles),
                "articles": articles,
                "user_preferences": user_categories,
                "is_mock": False,
                "timestamp": datetime.now().isoformat()
            }
        print(f"DEBUG: Returning real news data for category: {user_categories}, articles count: {len(articles)}")
        return jsonify(response_data)
            
    except Exception as e:
        # Fallback to mock data on error
        return jsonify({
            "category": user_categories[0],
            "count": 1,
            "articles": [{
                "id": f"error_{int(time.time())}",
                "title": f"Error fetching {user_categories[0]} news",
                "description": f"API Error: {str(e)}. Showing mock data.",
                "url": "#",
                "source": "Error Fallback",
                "category": user_categories[0],
                "published_at": datetime.now().isoformat(),
                "image_url": "https://via.placeholder.com/300x200/orange/white?text=API+ERROR",
                "is_static": True
            }],
            "error": str(e)
        })

@app.route('/api/news/trending')
@jwt_required()
def get_trending_news():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get user's news preferences
        news_prefs = UserPreference.find_by_user_and_category(current_user.get_id(), 'news')
        user_categories = news_prefs.preferences.get('categories', ['technology', 'business', 'entertainment', 'sports']) if news_prefs else ['technology', 'business', 'entertainment', 'sports']
        
        # Use user's preferred categories instead of hardcoded ones
        categories = user_categories[:4]  # Limit to 4 categories for trending
        all_articles = []
        
        for category in categories:
            try:
                if NEWS_API_KEY and NEWS_API_KEY != 'your_newsapi_key_here':
                    url = f"https://newsapi.org/v2/top-headlines?category={category}&apiKey={NEWS_API_KEY}&pageSize=5"
                    response = requests.get(url, timeout=5)
                    
                    if response.status_code == 200:
                        data = response.json()
                        for article in data.get('articles', []):
                            all_articles.append({
                                "id": f"trending_{int(time.time())}_{len(all_articles)}",
                                "title": article.get('title', ''),
                                "description": article.get('description', ''),
                                "url": article.get('url', ''),
                                "source": article.get('source', {}).get('name', ''),
                                "category": category,
                                "published_at": article.get('publishedAt', ''),
                                "image_url": article.get('urlToImage', ''),
                            })
                else:
                    # Add mock data if no API key or API fails
                    all_articles.append({
                        "id": f"mock_trending_{category}_{int(time.time())}",
                        "title": f"Trending {category.title()} News",
                        "description": f"Latest updates in {category}",
                        "url": "#",
                        "source": "Mock Source",
                        "category": category,
                        "published_at": datetime.now().isoformat(),
                        "image_url": "https://via.placeholder.com/300x200",
                    })
            except Exception as e:
                # Add mock data for failed categories
                all_articles.append({
                    "id": f"mock_trending_{category}_{int(time.time())}",
                    "title": f"Trending {category.title()} News",
                    "description": f"Latest updates in {category}",
                    "url": "#",
                    "source": "Mock Source",
                    "category": category,
                    "published_at": datetime.now().isoformat(),
                    "image_url": "https://via.placeholder.com/300x200",
                })
        
        return jsonify({
            "count": len(all_articles),
            "articles": all_articles
        })
    
    except Exception as e:
        return jsonify({
            "count": 0,
            "articles": [{
                "id": "error_trending",
                "title": "Error Loading Trending News",
                "description": "Unable to fetch trending news at this time",
                "url": "#",
                "source": "Error Fallback",
                "category": "general",
                "published_at": datetime.now().isoformat(),
                "image_url": "https://via.placeholder.com/300x200/red/white?text=ERROR",
            }],
            "error": str(e)
        })

@app.route('/api/news/search')
@jwt_required()
def search_news():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({"error": "Query parameter 'q' is required"}), 400
        
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Try to search with NewsAPI if available
        if NEWS_API_KEY and NEWS_API_KEY != 'your_newsapi_key_here':
            try:
                url = f"https://newsapi.org/v2/everything?q={query}&apiKey={NEWS_API_KEY}&pageSize=10&sortBy=relevancy"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    articles = []
                    for article in data.get('articles', []):
                        articles.append({
                            "id": f"search_{int(time.time())}_{len(articles)}",
                            "title": article.get('title', ''),
                            "description": article.get('description', ''),
                            "url": article.get('url', ''),
                            "source": article.get('source', {}).get('name', ''),
                            "category": "search",
                            "published_at": article.get('publishedAt', ''),
                            "image_url": article.get('urlToImage', ''),
                        })
                    
                    return jsonify({
                        "query": query,
                        "count": len(articles),
                        "articles": articles
                    })
            except Exception as e:
                pass  # Fall back to mock data
        
        # Mock search results fallback
        articles = [{
            "id": f"search_{int(time.time())}",
            "title": f"Search Results for: {query}",
            "description": f"Latest news and updates related to {query}",
            "url": "#",
            "source": "Search Results",
            "category": "search",
            "published_at": datetime.now().isoformat(),
            "image_url": "https://via.placeholder.com/300x200",
        }]
        
        return jsonify({
            "query": query,
            "count": len(articles),
            "articles": articles
        })
    
    except Exception as e:
        return jsonify({
            "query": query or "",
            "count": 0,
            "articles": [],
            "error": str(e)
        }), 500

# Jobs Service Endpoints
@app.route('/api/jobs')
def get_jobs():
    category = request.args.get('category', 'technology')
    
    # Mock job data
    jobs = [
        {
            "id": f"job_{int(time.time())}",
            "title": f"Senior {category.title()} Engineer",
            "company": "Tech Corp Inc.",
            "location": "San Francisco, CA",
            "type": "Full-time",
            "salary": "$120,000 - $180,000",
            "description": f"We are looking for a talented {category} professional to join our team.",
            "url": "https://example.com/jobs/1",
            "category": category,
            "posted_at": (datetime.now() - timedelta(hours=24)).isoformat(),
            "is_static": True
        },
        {
            "id": f"job_{int(time.time())}_2",
            "title": f"{category.title()} Specialist",
            "company": "Innovation Labs",
            "location": "Remote",
            "type": "Contract",
            "salary": "$80 - $120/hour",
            "description": f"Remote {category} position with flexible hours.",
            "url": "https://example.com/jobs/2",
            "category": category,
            "posted_at": (datetime.now() - timedelta(hours=12)).isoformat(),
            "is_static": True
        }
    ]
    
    return jsonify({
        "category": category,
        "count": len(jobs),
        "jobs": jobs,
        "message": "Add ADZUNA_APP_ID and ADZUNA_APP_KEY for real job data"
    })

@app.route('/api/jobs/trending')
def get_trending_jobs():
    jobs = [
        {
            "id": f"trending_job_{int(time.time())}",
            "title": "AI/ML Engineer",
            "company": "AI Startup Co.",
            "location": "Remote",
            "description": "Join our AI team to build cutting-edge machine learning solutions.",
            "url": "https://example.com/jobs/ai",
            "category": "ai",
            "posted_at": (datetime.now() - timedelta(hours=12)).isoformat(),
            "salary": "$100,000 - $150,000",
        },
        {
            "id": f"trending_job_{int(time.time())}_2",
            "title": "Cloud Solutions Architect",
            "company": "CloudTech Solutions",
            "location": "New York, NY",
            "description": "Design and implement cloud infrastructure solutions.",
            "url": "https://example.com/jobs/cloud",
            "category": "cloud",
            "posted_at": (datetime.now() - timedelta(hours=6)).isoformat(),
            "salary": "$130,000 - $200,000",
        }
    ]
    
    return jsonify({
        "count": len(jobs),
        "jobs": jobs
    })

@app.route('/api/jobs/search')
def search_jobs():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    jobs = [{
        "id": f"search_job_{int(time.time())}",
        "title": f"Jobs matching: {query}",
        "company": "Various Companies",
        "location": "Multiple Locations",
        "description": f"Job opportunities related to {query}",
        "url": "#",
        "category": "search",
        "posted_at": datetime.now().isoformat(),
        "salary": "Competitive",
    }]
    
    return jsonify({
        "query": query,
        "count": len(jobs),
        "jobs": jobs
    })

# Videos Service Endpoints (YouTube API)
@app.route('/api/videos')
def get_videos():
    category = request.args.get('category', 'technology')
    
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == 'your_youtube_api_key_here':
        # Return mock data if no API key
        videos = [
            {
                "id": f"video_{int(time.time())}",
                "title": f"⚠️ MOCK: Latest {category.title()} Trends",
                "description": f"This is mock data for {category}. Add YOUTUBE_API_KEY to get real videos.",
                "url": "https://youtube.com/watch?v=example1",
                "thumbnail": "https://via.placeholder.com/480x360/ff6b6b/ffffff?text=MOCK+DATA",
                "channel": "Mock Channel",
                "category": category,
                "published_at": (datetime.now() - timedelta(days=1)).isoformat(),
                "duration": "10:30",
                "views": "125K",
                "is_static": True
            }
        ]
        return jsonify({
            "category": category,
            "count": len(videos),
            "videos": videos,
            "message": "Add YOUTUBE_API_KEY to get real data"
        })
    
    # Real YouTube API call
    try:
        # Vary search queries to get different content
        search_queries = [
            f"{category} latest news",
            f"{category} trends 2025", 
            f"{category} updates",
            f"{category} tutorial",
            f"latest {category}",
            f"{category} review"
        ]
        import random
        search_query = random.choice(search_queries)
        
        # Vary ordering to get different results
        order_options = ['date', 'relevance', 'viewCount']
        order = random.choice(order_options)
        
        url = f"https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': search_query,
            'type': 'video',
            'maxResults': 15,
            'order': order,
            'publishedAfter': (datetime.now() - timedelta(days=30)).isoformat() + 'Z',  # Last 30 days
            'key': YOUTUBE_API_KEY
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            videos = []
            
            for item in data.get('items', []):
                snippet = item.get('snippet', {})
                video_id = item.get('id', {}).get('videoId', '')
                
                videos.append({
                    "id": video_id,
                    "title": snippet.get('title', ''),
                    "description": snippet.get('description', '')[:200] + '...' if len(snippet.get('description', '')) > 200 else snippet.get('description', ''),
                    "url": f"https://youtube.com/watch?v={video_id}",
                    "thumbnail": snippet.get('thumbnails', {}).get('medium', {}).get('url', ''),
                    "channel": snippet.get('channelTitle', ''),
                    "category": category,
                    "published_at": snippet.get('publishedAt', ''),
                    "is_static": False
                })
            
            return jsonify({
                "category": category,
                "count": len(videos),
                "videos": videos,
                "source": "YouTube API"
            })
        else:
            raise Exception(f"YouTube API returned status {response.status_code}")
            
    except Exception as e:
        # Fallback to mock data on error
        return jsonify({
            "category": category,
            "count": 1,
            "videos": [{
                "id": f"error_{int(time.time())}",
                "title": f"Error fetching {category} videos",
                "description": f"YouTube API Error: {str(e)}. Showing mock data.",
                "url": "#",
                "thumbnail": "https://via.placeholder.com/480x360/orange/white?text=API+ERROR",
                "channel": "Error Fallback",
                "category": category,
                "published_at": datetime.now().isoformat(),
                "is_static": True
            }],
            "error": str(e)
        })

# Reddit Service Endpoints
@app.route('/api/reddit')
def get_reddit_posts():
    subreddit = request.args.get('subreddit', 'technology')
    
    if not REDDIT_CLIENT_ID or REDDIT_CLIENT_ID == 'your_reddit_client_id_here':
        # Return mock data if no credentials
        posts = [
            {
                "id": f"reddit_{int(time.time())}",
                "title": f"⚠️ MOCK: Popular post from r/{subreddit}",
                "description": f"This is mock data for r/{subreddit}. Add REDDIT_CLIENT_ID and REDDIT_SECRET to get real posts.",
                "url": f"https://reddit.com/r/{subreddit}",
                "subreddit": subreddit,
                "author": "mock_user",
                "score": 1234,
                "comments": 56,
                "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                "is_static": True
            }
        ]
        return jsonify({
            "subreddit": subreddit,
            "count": len(posts),
            "posts": posts,
            "message": "Add REDDIT_CLIENT_ID and REDDIT_SECRET to get real data"
        })
    
    # Real Reddit API call
    try:
        # Get Reddit access token
        auth_url = "https://www.reddit.com/api/v1/access_token"
        auth_data = {
            'grant_type': 'client_credentials'
        }
        auth_headers = {
            'User-Agent': 'OneHub Dashboard/1.0'
        }
        
        auth_response = requests.post(
            auth_url, 
            data=auth_data, 
            headers=auth_headers,
            auth=(REDDIT_CLIENT_ID, REDDIT_SECRET),
            timeout=10
        )
        
        if auth_response.status_code == 200:
            token_data = auth_response.json()
            access_token = token_data.get('access_token')
            
            # Fetch posts from subreddit with varied sorting
            sort_options = ['hot', 'new', 'rising', 'top']
            import random
            sort_type = random.choice(sort_options)
            
            posts_url = f"https://oauth.reddit.com/r/{subreddit}/{sort_type}"
            posts_headers = {
                'Authorization': f'Bearer {access_token}',
                'User-Agent': 'OneHub Dashboard/1.0'
            }
            posts_params = {
                'limit': 15,
                't': 'day' if sort_type == 'top' else None  # For top posts, get daily top
            }
            # Remove None values
            posts_params = {k: v for k, v in posts_params.items() if v is not None}
            
            posts_response = requests.get(posts_url, headers=posts_headers, params=posts_params, timeout=10)
            
            if posts_response.status_code == 200:
                data = posts_response.json()
                posts = []
                
                for post_data in data.get('data', {}).get('children', []):
                    post = post_data.get('data', {})
                    
                    posts.append({
                        "id": post.get('id', ''),
                        "title": post.get('title', ''),
                        "description": post.get('selftext', '')[:200] + '...' if len(post.get('selftext', '')) > 200 else post.get('selftext', ''),
                        "url": f"https://reddit.com{post.get('permalink', '')}",
                        "subreddit": post.get('subreddit', subreddit),
                        "author": post.get('author', 'unknown'),
                        "score": post.get('score', 0),
                        "comments": post.get('num_comments', 0),
                        "created_at": datetime.fromtimestamp(post.get('created_utc', 0)).isoformat(),
                        "is_static": False
                    })
                
                return jsonify({
                    "subreddit": subreddit,
                    "count": len(posts),
                    "posts": posts,
                    "source": "Reddit API"
                })
            else:
                raise Exception(f"Reddit posts API returned status {posts_response.status_code}")
        else:
            raise Exception(f"Reddit auth failed with status {auth_response.status_code}")
            
    except Exception as e:
        # Fallback to mock data on error
        return jsonify({
            "subreddit": subreddit,
            "count": 1,
            "posts": [{
                "id": f"error_{int(time.time())}",
                "title": f"Error fetching r/{subreddit} posts",
                "description": f"Reddit API Error: {str(e)}. Showing mock data.",
                "url": "#",
                "subreddit": subreddit,
                "author": "error_fallback",
                "score": 0,
                "comments": 0,
                "created_at": datetime.now().isoformat(),
                "is_static": True
            }],
            "error": str(e)
        })

@app.route('/api/reddit/trending')
def get_trending_reddit():
    subreddits = ['technology', 'programming', 'science', 'worldnews', 'todayilearned']
    all_posts = []
    
    for subreddit in subreddits:
        try:
            if REDDIT_CLIENT_ID and REDDIT_CLIENT_ID != 'your_reddit_client_id_here':
                # Get Reddit access token
                auth_url = "https://www.reddit.com/api/v1/access_token"
                auth_data = {'grant_type': 'client_credentials'}
                auth_headers = {'User-Agent': 'OneHub Dashboard/1.0'}
                
                auth_response = requests.post(
                    auth_url, 
                    data=auth_data, 
                    headers=auth_headers,
                    auth=(REDDIT_CLIENT_ID, REDDIT_SECRET),
                    timeout=5
                )
                
                if auth_response.status_code == 200:
                    token_data = auth_response.json()
                    access_token = token_data.get('access_token')
                    
                    posts_url = f"https://oauth.reddit.com/r/{subreddit}/hot"
                    posts_headers = {
                        'Authorization': f'Bearer {access_token}',
                        'User-Agent': 'OneHub Dashboard/1.0'
                    }
                    posts_params = {'limit': 2}
                    
                    posts_response = requests.get(posts_url, headers=posts_headers, params=posts_params, timeout=5)
                    
                    if posts_response.status_code == 200:
                        data = posts_response.json()
                        for post_data in data.get('data', {}).get('children', []):
                            post = post_data.get('data', {})
                            all_posts.append({
                                "id": post.get('id', ''),
                                "title": post.get('title', ''),
                                "description": post.get('selftext', '')[:150] + '...' if len(post.get('selftext', '')) > 150 else post.get('selftext', ''),
                                "url": f"https://reddit.com{post.get('permalink', '')}",
                                "subreddit": post.get('subreddit', subreddit),
                                "author": post.get('author', 'unknown'),
                                "score": post.get('score', 0),
                                "comments": post.get('num_comments', 0),
                                "created_at": datetime.fromtimestamp(post.get('created_utc', 0)).isoformat(),
                            })
        except:
            # Add mock data for failed subreddits
            all_posts.append({
                "id": f"mock_reddit_{subreddit}_{int(time.time())}",
                "title": f"Trending post from r/{subreddit}",
                "description": f"Latest discussions in {subreddit}",
                "url": f"https://reddit.com/r/{subreddit}",
                "subreddit": subreddit,
                "author": "mock_user",
                "score": 100,
                "comments": 25,
                "created_at": datetime.now().isoformat(),
            })
    
    return jsonify({
        "count": len(all_posts),
        "posts": all_posts
    })

# Deals Service Endpoints
@app.route('/api/deals')
def get_deals():
    category = request.args.get('category', 'electronics')
    
    deals = [
        {
            "id": f"deal_{int(time.time())}",
            "title": f"Amazing {category.title()} Deal",
            "description": f"Great discount on {category} items",
            "url": "https://example.com/deals/1",
            "platform": "Amazon",
            "category": category,
            "price": 79.99,
            "original_price": 129.99,
            "discount": 38.46,
            "image_url": "https://via.placeholder.com/300x200",
            "valid_until": (datetime.now() + timedelta(days=7)).isoformat()
        },
        {
            "id": f"deal_{int(time.time())}_2",
            "title": f"{category.title()} Special Offer",
            "description": f"Limited time offer on {category}",
            "url": "https://example.com/deals/2",
            "platform": "Flipkart",
            "category": category,
            "price": 299.99,
            "original_price": 399.99,
            "discount": 25.0,
            "image_url": "https://via.placeholder.com/300x200",
            "valid_until": (datetime.now() + timedelta(days=5)).isoformat()
        }
    ]
    
    return jsonify({
        "category": category,
        "count": len(deals),
        "deals": deals
    })

# User Service Endpoints
@app.route('/api/users', methods=['POST'])
def create_user():
    user_data = request.get_json()
    
    # Log the received data for debugging
    print(f"Received user data: {user_data}")
    
    if not user_data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate required fields
    if not user_data.get('name') or not user_data.get('email'):
        return jsonify({"error": "Name and email are required"}), 400
    
    user = {
        "id": f"user_{int(time.time())}",
        "email": user_data.get('email'),
        "name": user_data.get('name'),
        "interests": user_data.get('interests', []),
        "preferences": {
            "news_categories": [interest.lower() for interest in user_data.get('interests', []) if interest.lower() in ['technology', 'business', 'sports', 'politics', 'science', 'finance']],
            "job_categories": [interest.lower() for interest in user_data.get('interests', []) if interest.lower() in ['ai', 'cloud', 'startup', 'remote', 'finance', 'marketing']],
            "entertainment_preferences": [interest.lower() for interest in user_data.get('interests', []) if interest.lower() in ['movies', 'music', 'gaming', 'comedy', 'documentary']],
            "shopping_categories": [interest.lower() for interest in user_data.get('interests', []) if interest.lower() in ['fashion', 'electronics', 'home', 'books', 'beauty']],
            "food_preferences": [interest.lower() for interest in user_data.get('interests', []) if interest.lower() in ['pizza', 'desserts', 'indian', 'italian', 'chinese', 'healthy']]
        },
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    print(f"Created user profile: {user}")
    return jsonify(user)

@app.route('/api/users/<user_id>')
def get_user(user_id):
    user = {
        "id": user_id,
        "email": "user@example.com",
        "name": "Demo User",
        "interests": ["technology", "ai", "business"],
        "created_at": (datetime.now() - timedelta(days=30)).isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    return jsonify(user)

# Recommendations Service
@app.route('/api/recommendations')
def get_recommendations():
    user_id = request.args.get('user_id', 'default_user')
    
    recommendations = [
        {
            "id": f"rec_{int(time.time())}",
            "type": "news",
            "title": "AI Breakthrough in Healthcare",
            "description": "Latest AI developments",
            "url": "/api/news",
            "category": "technology",
            "score": 0.95
        },
        {
            "id": f"rec_{int(time.time())}_2",
            "type": "job",
            "title": "Senior Developer Position",
            "description": "Great opportunity in tech",
            "url": "/api/jobs",
            "category": "technology",
            "score": 0.88
        }
    ]
    
    return jsonify({
        "user_id": user_id,
        "count": len(recommendations),
        "recommendations": recommendations
    })

# Weather API endpoints - Rebuilt from scratch
@app.route('/api/weather')
@jwt_required()
def get_weather():
    try:
        city = request.args.get('city', 'London')
        
        # Multiple API keys to try
        api_keys = [
            "8ac5c4e57ba6a4b3dfcf622700447b1e",
            "b8ecb570e8de5b1ea8dcbf7c6fb7c02e", 
            "46575fbd9144430bb7dce528004ec99e",
            "3b7b8a9c5d2e1f4a6b8c9d0e1f2a3b4c"
        ]
        
        weather_data = None
        
        # Try each API key until one works
        for api_key in api_keys:
            try:
                # Current weather
                current_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
                current_response = requests.get(current_url, timeout=8)
                
                if current_response.status_code == 200:
                    current_data = current_response.json()
                    
                    # 5-day forecast
                    forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
                    forecast_response = requests.get(forecast_url, timeout=8)
                    
                    forecast_list = []
                    if forecast_response.status_code == 200:
                        forecast_data = forecast_response.json()
                        
                        # Group forecasts by date to get daily highs/lows
                        daily_forecasts = {}
                        for item in forecast_data.get('list', []):
                            date_str = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
                            day_name = datetime.fromtimestamp(item['dt']).strftime('%A')
                            
                            if date_str not in daily_forecasts:
                                daily_forecasts[date_str] = {
                                    'day': day_name,
                                    'temps': [],
                                    'descriptions': [],
                                    'icons': [],
                                    'timestamp': item['dt']
                                }
                            
                            daily_forecasts[date_str]['temps'].append(item['main']['temp'])
                            daily_forecasts[date_str]['descriptions'].append(item['weather'][0]['description'])
                            daily_forecasts[date_str]['icons'].append(item['weather'][0]['icon'])
                        
                        # Convert to forecast list with accurate highs/lows
                        sorted_dates = sorted(daily_forecasts.keys())
                        for date_str in sorted_dates[:5]:
                            day_data = daily_forecasts[date_str]
                            temps = day_data['temps']
                            
                            # Get most common description and icon for the day
                            most_common_desc = max(set(day_data['descriptions']), key=day_data['descriptions'].count)
                            most_common_icon = max(set(day_data['icons']), key=day_data['icons'].count)
                            
                            forecast_list.append({
                                "day": day_data['day'],
                                "high": int(max(temps)),
                                "low": int(min(temps)),
                                "description": most_common_desc.title(),
                                "icon": most_common_icon
                            })
                    
                    # If forecast failed, create realistic forecast based on current weather
                    if not forecast_list:
                        base_temp = int(current_data['main']['temp'])
                        base_desc = current_data['weather'][0]['description']
                        base_icon = current_data['weather'][0]['icon']
                        
                        # Generate more realistic variations
                        weather_variations = [
                            {"desc": base_desc, "icon": base_icon, "temp_mod": 0},
                            {"desc": "Partly cloudy", "icon": "02d", "temp_mod": -2},
                            {"desc": "Light rain", "icon": "10d", "temp_mod": -4},
                            {"desc": "Cloudy", "icon": "03d", "temp_mod": -1},
                            {"desc": "Sunny", "icon": "01d", "temp_mod": 3}
                        ]
                        
                        days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday']
                        for i, day in enumerate(days):
                            variation = weather_variations[i % len(weather_variations)]
                            high_temp = base_temp + variation['temp_mod'] + (i - 2)
                            low_temp = high_temp - 8
                            
                            forecast_list.append({
                                "day": day,
                                "high": max(high_temp, low_temp + 5),  # Ensure high > low
                                "low": low_temp,
                                "description": variation['desc'].title(),
                                "icon": variation['icon']
                            })
                    
                    weather_data = {
                        "city": current_data['name'],
                        "country": current_data['sys']['country'],
                        "temperature": int(current_data['main']['temp']),
                        "feels_like": int(current_data['main']['feels_like']),
                        "description": current_data['weather'][0]['description'].title(),
                        "humidity": current_data['main']['humidity'],
                        "wind_speed": int(current_data['wind']['speed'] * 3.6),
                        "pressure": current_data['main']['pressure'],
                        "visibility": current_data.get('visibility', 10000) // 1000,
                        "icon": current_data['weather'][0]['icon'],
                        "forecast": forecast_list,
                        "is_mock": False,
                        "timestamp": datetime.now().isoformat()
                    }
                    break
                    
            except Exception as e:
                continue
        
        # If all APIs failed, try alternative weather service
        if not weather_data:
            try:
                # Try wttr.in as backup
                wttr_url = f"https://wttr.in/{city}?format=j1"
                wttr_response = requests.get(wttr_url, timeout=5)
                
                if wttr_response.status_code == 200:
                    wttr_data = wttr_response.json()
                    current = wttr_data['current_condition'][0]
                    
                    weather_data = {
                        "city": city.title(),
                        "country": "",
                        "temperature": int(current['temp_C']),
                        "feels_like": int(current['FeelsLikeC']),
                        "description": current['weatherDesc'][0]['value'],
                        "humidity": int(current['humidity']),
                        "wind_speed": int(float(current['windspeedKmph'])),
                        "pressure": int(current['pressure']),
                        "visibility": int(current['visibility']),
                        "icon": "01d",  # Default icon
                        "forecast": [
                            {
                                "day": "Today",
                                "high": int(wttr_data['weather'][0]['maxtempC']),
                                "low": int(wttr_data['weather'][0]['mintempC']),
                                "description": wttr_data['weather'][0]['hourly'][0]['weatherDesc'][0]['value'],
                                "icon": "01d"
                            },
                            {
                                "day": "Tomorrow",
                                "high": int(wttr_data['weather'][1]['maxtempC']) if len(wttr_data['weather']) > 1 else int(wttr_data['weather'][0]['maxtempC']) - 2,
                                "low": int(wttr_data['weather'][1]['mintempC']) if len(wttr_data['weather']) > 1 else int(wttr_data['weather'][0]['mintempC']) - 3,
                                "description": wttr_data['weather'][1]['hourly'][0]['weatherDesc'][0]['value'] if len(wttr_data['weather']) > 1 else "Partly Cloudy",
                                "icon": "02d"
                            },
                            {
                                "day": "Wednesday",
                                "high": int(wttr_data['weather'][2]['maxtempC']) if len(wttr_data['weather']) > 2 else int(wttr_data['weather'][0]['maxtempC']) + 1,
                                "low": int(wttr_data['weather'][2]['mintempC']) if len(wttr_data['weather']) > 2 else int(wttr_data['weather'][0]['mintempC']) - 1,
                                "description": wttr_data['weather'][2]['hourly'][0]['weatherDesc'][0]['value'] if len(wttr_data['weather']) > 2 else "Light Rain",
                                "icon": "10d"
                            },
                            {
                                "day": "Thursday",
                                "high": int(wttr_data['weather'][0]['maxtempC']) + 3,
                                "low": int(wttr_data['weather'][0]['mintempC']) + 1,
                                "description": "Sunny",
                                "icon": "01d"
                            },
                            {
                                "day": "Friday",
                                "high": int(wttr_data['weather'][0]['maxtempC']) - 1,
                                "low": int(wttr_data['weather'][0]['mintempC']) - 2,
                                "description": "Cloudy",
                                "icon": "03d"
                            }
                        ],
                        "is_mock": False,
                        "timestamp": datetime.now().isoformat()
                    }
            except:
                pass
        
        # Final fallback to mock data
        if not weather_data:
            weather_data = {
                "city": city.title(),
                "country": "",
                "temperature": 22,
                "feels_like": 25,
                "description": "Partly Cloudy",
                "humidity": 65,
                "wind_speed": 12,
                "pressure": 1013,
                "visibility": 10,
                "icon": "02d",
                "forecast": [
                    {"day": "Today", "high": 24, "low": 18, "description": "Partly Cloudy", "icon": "02d"},
                    {"day": "Tomorrow", "high": 26, "low": 20, "description": "Sunny", "icon": "01d"},
                    {"day": "Wednesday", "high": 23, "low": 17, "description": "Light Rain", "icon": "10d"},
                    {"day": "Thursday", "high": 25, "low": 19, "description": "Cloudy", "icon": "03d"},
                    {"day": "Friday", "high": 27, "low": 21, "description": "Sunny", "icon": "01d"}
                ],
                "is_mock": True,
                "timestamp": datetime.now().isoformat()
            }
        
        return jsonify(weather_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Weather service unavailable: {str(e)}'}), 500

# Crypto API endpoints
@app.route('/api/crypto')
@jwt_required()
def get_crypto():
    try:
        # CoinGecko API (free, no API key required)
        url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h"
        
        response = requests.get(url)
        
        if response.status_code == 200:
            crypto_data = response.json()
            
            # Format the data
            formatted_data = []
            for coin in crypto_data:
                formatted_data.append({
                    "id": coin['id'],
                    "name": coin['name'],
                    "symbol": coin['symbol'].upper(),
                    "price": coin['current_price'],
                    "change_24h": coin['price_change_percentage_24h'],
                    "market_cap": coin['market_cap'],
                    "volume": coin['total_volume'],
                    "image": coin['image'],
                    "rank": coin['market_cap_rank']
                })
            
            return jsonify({
                "cryptocurrencies": formatted_data,
                "count": len(formatted_data),
                "last_updated": datetime.utcnow().isoformat()
            }), 200
        else:
            # Return mock data if API fails
            mock_crypto = {
                "cryptocurrencies": [
                    {"id": "bitcoin", "name": "Bitcoin", "symbol": "BTC", "price": 43250.50, "change_24h": 2.34, "market_cap": 850000000000, "volume": 25000000000, "rank": 1},
                    {"id": "ethereum", "name": "Ethereum", "symbol": "ETH", "price": 2650.75, "change_24h": -1.23, "market_cap": 320000000000, "volume": 15000000000, "rank": 2},
                    {"id": "binancecoin", "name": "BNB", "symbol": "BNB", "price": 315.20, "change_24h": 0.89, "market_cap": 48000000000, "volume": 1200000000, "rank": 3}
                ],
                "count": 3,
                "last_updated": datetime.utcnow().isoformat(),
                "is_mock": True
            }
            return jsonify(mock_crypto), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Recipe API endpoints - Rebuilt from scratch
@app.route('/api/recipes')
@jwt_required()
def get_recipes():
    try:
        current_user = get_current_user()
        
        # Get user's food preferences
        food_prefs = UserPreference.find_by_user_and_category(current_user.get_id(), 'food')
        user_cuisines = food_prefs.preferences.get('cuisines', ['italian', 'american']) if food_prefs else ['italian', 'american']
        user_dietary = food_prefs.preferences.get('dietary', []) if food_prefs else []
        
        query = request.args.get('query', '')
        
        # Check if user is vegetarian/vegan
        is_vegetarian = any(diet.lower() in ['vegetarian', 'vegan', 'plant-based'] for diet in user_dietary)
        
        recipes = []
        
        try:
            # Strategy 1: Search based on user's preferred cuisines first
            if not query.strip():
                # Load recipes matching user's cuisine preferences
                for cuisine in user_cuisines[:3]:  # Try top 3 cuisines
                    if len(recipes) >= 8:
                        break
                    
                    cuisine_mapping = {
                        'italian': 'Italian',
                        'chinese': 'Chinese', 
                        'indian': 'Indian',
                        'mexican': 'Mexican',
                        'french': 'French',
                        'american': 'American',
                        'british': 'British',
                        'thai': 'Thai',
                        'japanese': 'Japanese'
                    }
                    
                    mapped_cuisine = cuisine_mapping.get(cuisine.lower(), cuisine.title())
                    
                    try:
                        # Search by cuisine area first, then filter by diet
                        cuisine_url = f"https://www.themealdb.com/api/json/v1/1/filter.php?a={mapped_cuisine}"
                        response = requests.get(cuisine_url, timeout=8)
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data.get('meals'):
                                cuisine_recipes_added = 0
                                for meal in data['meals']:
                                    if len(recipes) >= 8 or cuisine_recipes_added >= 3:
                                        break
                                    
                                    # Get detailed recipe info
                                    detail_url = f"https://www.themealdb.com/api/json/v1/1/lookup.php?i={meal['idMeal']}"
                                    detail_response = requests.get(detail_url, timeout=5)
                                    
                                    if detail_response.status_code == 200:
                                        detail_data = detail_response.json()
                                        if detail_data.get('meals'):
                                            detailed_meal = detail_data['meals'][0]
                                            
                                            # Skip if already added
                                            if any(r['id'] == detailed_meal['idMeal'] for r in recipes):
                                                continue
                                            
                                            # Verify cuisine matches
                                            meal_area = detailed_meal.get('strArea', '').lower()
                                            if meal_area != cuisine.lower():
                                                continue
                                            
                                            # Filter for vegetarian users
                                            meal_name = detailed_meal.get('strMeal', '').lower()
                                            meal_category = detailed_meal.get('strCategory', '').lower()
                                            
                                            if is_vegetarian:
                                                meat_keywords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'seafood', 'meat', 'turkey', 'duck', 'bacon']
                                                if any(keyword in meal_name or keyword in meal_category for keyword in meat_keywords):
                                                    continue
                                            
                                            recipes.append(format_recipe(detailed_meal, user_dietary, is_vegetarian))
                                            cuisine_recipes_added += 1
                    except:
                        continue
            
            # Strategy 2: Search by query if provided
            if query.strip():
                search_url = f"https://www.themealdb.com/api/json/v1/1/search.php?s={query}"
                try:
                    response = requests.get(search_url, timeout=8)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('meals'):
                            for meal in data['meals'][:6]:
                                if len(recipes) >= 8:
                                    break
                                
                                # Skip if already added
                                if any(r['id'] == meal['idMeal'] for r in recipes):
                                    continue
                                
                                # Filter for vegetarian users
                                meal_name = meal.get('strMeal', '').lower()
                                meal_category = meal.get('strCategory', '').lower()
                                
                                if is_vegetarian:
                                    meat_keywords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'seafood', 'meat', 'turkey', 'duck', 'bacon']
                                    if any(keyword in meal_name or keyword in meal_category for keyword in meat_keywords):
                                        continue
                                
                                recipes.append(format_recipe(meal, user_dietary, is_vegetarian))
                        else:
                            # No recipes found for search query
                            return jsonify({
                                "recipes": [],
                                "query": query,
                                "user_preferences": {"cuisines": user_cuisines, "dietary": user_dietary},
                                "count": 0,
                                "is_mock": False,
                                "no_results": True,
                                "message": f"No recipes found for '{query}'. Try searching for something else!"
                            }), 200
                except:
                    pass
            
            # If we have recipes, return them
            if recipes:
                return jsonify({
                    "recipes": recipes[:8],  # Limit to 8 recipes
                    "query": query,
                    "user_preferences": {"cuisines": user_cuisines, "dietary": user_dietary},
                    "count": len(recipes[:8]),
                    "is_mock": False
                }), 200
            else:
                raise Exception("No recipes found")
                
        except Exception as e:
            # Enhanced fallback with more diverse and realistic mock data
            import random
            
            # Create diverse recipe variations based on user preferences and query
            recipe_templates = []
            
            if is_vegetarian:
                recipe_templates = [
                    {
                        "title": f"Vegetarian {query.title()} Curry",
                        "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
                        "ingredients": ["2 cups mixed vegetables", "1 can coconut milk", "2 tbsp curry powder", "1 onion diced", "3 cloves garlic", "1 inch ginger", "2 tbsp oil", "Salt to taste", "Fresh cilantro", "Basmati rice"],
                        "instructions": "1. Heat oil in a large pan over medium heat. 2. Add onion, garlic, and ginger, cook until fragrant. 3. Add curry powder and cook for 1 minute. 4. Add vegetables and cook for 5 minutes. 5. Pour in coconut milk and simmer for 15 minutes. 6. Season with salt and garnish with cilantro. 7. Serve over basmati rice.",
                        "time": 35,
                        "cuisine": "Indian"
                    },
                    {
                        "title": f"Mediterranean {query.title()} Bowl",
                        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
                        "ingredients": ["1 cup quinoa", "1 cucumber diced", "2 tomatoes chopped", "1/2 red onion", "1/4 cup olives", "1/4 cup feta cheese", "3 tbsp olive oil", "2 tbsp lemon juice", "1 tsp oregano", "Fresh parsley"],
                        "instructions": "1. Cook quinoa according to package instructions and let cool. 2. Dice cucumber, tomatoes, and red onion. 3. In a large bowl, combine quinoa with vegetables. 4. Add olives and feta cheese. 5. Whisk together olive oil, lemon juice, and oregano. 6. Pour dressing over salad and toss. 7. Garnish with fresh parsley.",
                        "time": 25,
                        "cuisine": "Mediterranean"
                    },
                    {
                        "title": f"Asian {query.title()} Stir-fry",
                        "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop",
                        "ingredients": ["200g tofu cubed", "2 cups mixed stir-fry vegetables", "3 tbsp soy sauce", "2 tbsp sesame oil", "1 tbsp rice vinegar", "2 cloves garlic minced", "1 tsp ginger grated", "2 green onions", "1 tbsp sesame seeds", "Cooked rice"],
                        "instructions": "1. Press tofu to remove excess water, then cube. 2. Heat sesame oil in a wok over high heat. 3. Add tofu and cook until golden, about 5 minutes. 4. Add garlic and ginger, cook for 30 seconds. 5. Add vegetables and stir-fry for 3-4 minutes. 6. Mix soy sauce and rice vinegar, pour over stir-fry. 7. Garnish with green onions and sesame seeds. 8. Serve over rice.",
                        "time": 20,
                        "cuisine": "Asian"
                    }
                ]
            else:
                recipe_templates = [
                    {
                        "title": f"Grilled {query.title()} with Herbs",
                        "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
                        "ingredients": ["4 chicken breasts", "3 tbsp olive oil", "2 tbsp fresh rosemary", "3 cloves garlic minced", "1 lemon juiced", "Salt and pepper", "2 cups roasted vegetables", "1 lb baby potatoes"],
                        "instructions": "1. Marinate chicken in olive oil, rosemary, garlic, and lemon juice for 30 minutes. 2. Preheat grill to medium-high heat. 3. Season chicken with salt and pepper. 4. Grill chicken for 6-7 minutes per side until cooked through. 5. Meanwhile, roast vegetables and potatoes at 400°F for 25 minutes. 6. Let chicken rest for 5 minutes before serving. 7. Serve with roasted vegetables and potatoes.",
                        "time": 45,
                        "cuisine": "American"
                    },
                    {
                        "title": f"Spicy {query.title()} Pasta",
                        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
                        "ingredients": ["400g pasta", "500g ground beef", "1 onion diced", "4 cloves garlic", "1 can crushed tomatoes", "2 tbsp tomato paste", "1 tsp red pepper flakes", "1 tsp oregano", "1/2 cup red wine", "Parmesan cheese", "Fresh basil"],
                        "instructions": "1. Cook pasta according to package directions. 2. In a large pan, brown ground beef over medium-high heat. 3. Add onion and garlic, cook until softened. 4. Add tomato paste and cook for 1 minute. 5. Add crushed tomatoes, red wine, red pepper flakes, and oregano. 6. Simmer for 20 minutes until sauce thickens. 7. Toss with cooked pasta. 8. Serve with Parmesan and fresh basil.",
                        "time": 35,
                        "cuisine": "Italian"
                    },
                    {
                        "title": f"Pan-seared {query.title()} with Sauce",
                        "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop",
                        "ingredients": ["4 salmon fillets", "2 tbsp butter", "1 lemon", "2 tbsp capers", "1/4 cup white wine", "2 tbsp fresh dill", "1 lb asparagus", "Salt and pepper", "Olive oil"],
                        "instructions": "1. Season salmon fillets with salt and pepper. 2. Heat olive oil in a large skillet over medium-high heat. 3. Cook salmon skin-side up for 4 minutes, then flip and cook 3 more minutes. 4. Remove salmon and set aside. 5. Add butter, lemon juice, capers, and wine to pan. 6. Cook until sauce reduces slightly. 7. Meanwhile, roast asparagus with olive oil at 425°F for 12 minutes. 8. Serve salmon with sauce and asparagus, garnished with dill.",
                        "time": 25,
                        "cuisine": "French"
                    }
                ]
            
            # Select random recipes and customize them
            selected_templates = random.sample(recipe_templates, min(3, len(recipe_templates)))
            mock_recipes_list = []
            
            for i, template in enumerate(selected_templates):
                # Calculate nutrition based on ingredients
                protein_count = len([ing for ing in template['ingredients'] if any(p in ing.lower() for p in ['chicken', 'beef', 'salmon', 'tofu', 'cheese', 'egg'])])
                carb_count = len([ing for ing in template['ingredients'] if any(c in ing.lower() for c in ['pasta', 'rice', 'potato', 'quinoa', 'bread'])])
                
                mock_recipes_list.append({
                    "id": f"mock_{i+1}",
                    "title": template['title'],
                    "image": template['image'],
                    "ready_in_minutes": template['time'],
                    "servings": 4,
                    "cuisine": [template['cuisine']],
                    "dietary": user_dietary[:2] if user_dietary else (['Vegetarian'] if is_vegetarian else []),
                    "ingredients": template['ingredients'],
                    "instructions": template['instructions'],
                    "source_url": "",
                    "nutrition": {
                        "calories": 300 + (protein_count * 50) + (carb_count * 30),
                        "protein": f"{15 + (protein_count * 10)}g",
                        "carbs": f"{30 + (carb_count * 15)}g",
                        "fat": f"{12 + (protein_count * 3)}g"
                    }
                })
            
            mock_recipes = {
                "recipes": mock_recipes_list,
                "query": query,
                "user_preferences": {"cuisines": user_cuisines, "dietary": user_dietary},
                "count": len(mock_recipes_list),
                "is_mock": True
            }
            return jsonify(mock_recipes), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Recipe request submission endpoint
@app.route('/api/recipe-request', methods=['POST'])
@jwt_required()
def submit_recipe_request():
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        recipe_name = data.get('recipe_name', '').strip()
        cuisine = data.get('cuisine', '').strip()
        dietary_preferences = data.get('dietary_preferences', [])
        description = data.get('description', '').strip()
        
        if not recipe_name or not cuisine:
            return jsonify({'error': 'Recipe name and cuisine are required'}), 400
        
        # Create and save recipe request
        recipe_request = RecipeRequest(
            user_id=current_user.get_id(),
            recipe_name=recipe_name,
            cuisine=cuisine,
            dietary_preferences=dietary_preferences,
            description=description
        )
        
        request_id = recipe_request.save()
        
        if request_id:
            return jsonify({
                'message': 'Recipe request submitted successfully!',
                'request_id': request_id
            }), 201
        else:
            return jsonify({'error': 'Failed to submit recipe request'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    print("📍 Backend running on: http://localhost:5000")
    print("🔍 Health check: http://localhost:5000/health")
    print("📊 API endpoints: http://localhost:5000/api/")
    app.run(debug=True, host='0.0.0.0', port=5000)
