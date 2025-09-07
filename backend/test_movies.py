import requests
import os
from flask import Flask
from database import mongo, UserPreference
from dotenv import load_dotenv

# ===== Initialize Flask app and MongoDB =====
load_dotenv()
app = Flask(__name__)
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/onehub')
mongo.init_app(app)

# ===== Fetch user preferences from MongoDB =====
def get_user_preferences(user_id, category="movies"):
    """Fetch user preferences from MongoDB"""
    try:
        with app.app_context():
            user_pref = UserPreference.find_by_user_and_category(user_id, category)
            if user_pref:
                return user_pref.preferences
            else:
                print(f"No preferences found for user {user_id} in category {category}")
                return None
    except Exception as e:
        print(f"Error fetching user preferences: {e}")
        return None

# Use the user_id from your MongoDB document
user_id = "68bd6bfd117df3cb69f3aa60"
user_preferences_data = get_user_preferences(user_id, "movies")

if user_preferences_data:
    genres = user_preferences_data.get("genres", [])
    languages = user_preferences_data.get("languages", [])
    print("User Preferences (from MongoDB):")
    print("Genres:", genres)
    print("Languages:", languages)
else:
    # Fallback to default preferences if none found in database
    print("Using fallback preferences...")
    genres = ["action", "comedy"]
    languages = ["english"]

# ===== TMDB API Setup =====
API_KEY = "cd3bf45901d632d42b8e91e3737a9160"
BASE_URL = "https://api.themoviedb.org/3"

# TMDB genre mapping
GENRE_MAP = {
    "action": 28,
    "comedy": 35,
    "horror": 27,
    "romance": 10749,
    "thriller": 53,
    "drama": 18
}

# ===== Helper function =====
def fetch_movies(endpoint, params={}):
    params["api_key"] = API_KEY
    params["language"] = "en-US"
    response = requests.get(f"{BASE_URL}{endpoint}", params=params)
    return response.json().get("results", [])

# ===== Fetch popular and upcoming movies =====
popular_movies = fetch_movies("/movie/popular")
upcoming_movies = fetch_movies("/movie/upcoming")

# ===== Filter movies based on user preferences =====
def filter_movies(movies, genres, languages):
    filtered = []
    wanted_genres = [GENRE_MAP[g.lower()] for g in genres if g.lower() in GENRE_MAP]

    for movie in movies:
        movie_genres = movie.get("genre_ids", [])
        movie_lang = movie.get("original_language", "")

        # Check genre match
        genre_match = any(g in movie_genres for g in wanted_genres)
        # Check language match
        lang_match = movie_lang.lower() in [l.lower()[0:2] for l in languages]

        if genre_match or lang_match:
            filtered.append(movie)

    return filtered

popular_filtered = filter_movies(popular_movies, genres, languages)
upcoming_filtered = filter_movies(upcoming_movies, genres, languages)

# ===== Show results (formatted) =====
def display_movie_info(movies, title):
    print(f"\n{title}:")
    if not movies:
        print("No movies found.")
        return
    for movie in movies:
        title = movie.get("title", "N/A")
        release_date = movie.get("release_date", "N/A")
        language = movie.get("original_language", "N/A")
        rating = movie.get("vote_average", "N/A")
        vote_count = movie.get("vote_count", "N/A")
        overview = movie.get("overview", "No overview available.")
        poster_path = movie.get("poster_path", None)
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "No poster available"

        print(f"""
🎬 Title: {title}  
📅 Release Date: {release_date}  
🌍 Language: {language}  
⭐ Rating: {rating} ({vote_count} votes)  
📖 Overview: {overview}  
🖼 Poster: {poster_url}
        """)

# ✅ Call the function
display_movie_info(popular_filtered, "Popular Movies (Based on Preferences)")
display_movie_info(upcoming_filtered, "Upcoming Movies (Based on Preferences)")