import os
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from datetime import datetime
from bson import ObjectId
import json

# Initialize MongoDB and Bcrypt
mongo = PyMongo()
bcrypt = Bcrypt()

class User:
    def __init__(self, email=None, name=None, password_hash=None, _id=None):
        self.email = email
        self.name = name
        self.password_hash = password_hash
        self.is_active = True
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self._id = _id

    def get_id(self):
        return str(self._id) if self._id else None

    def to_dict(self):
        return {
            'id': self.get_id(),
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

    def save(self):
        try:
            user_data = {
                'email': self.email,
                'name': self.name,
                'password_hash': self.password_hash,
                'is_active': self.is_active,
                'created_at': self.created_at,
                'updated_at': self.updated_at
            }
            
            if self._id:
                # Update existing user
                result = mongo.db.users.update_one(
                    {'_id': self._id},
                    {'$set': user_data}
                )
                return result.modified_count > 0
            else:
                # Create new user
                result = mongo.db.users.insert_one(user_data)
                self._id = result.inserted_id
                return True
        except Exception as e:
            print(f"Error saving user: {e}")
            return False

    @staticmethod
    def find_by_email(email):
        try:
            user_data = mongo.db.users.find_one({'email': email})
            if user_data:
                user = User()
                user.email = user_data['email']
                user.name = user_data['name']
                user.password_hash = user_data['password_hash']
                user.is_active = user_data.get('is_active', True)
                user.created_at = user_data.get('created_at', datetime.utcnow())
                user.updated_at = user_data.get('updated_at', datetime.utcnow())
                user._id = user_data['_id']
                return user
            return None
        except Exception as e:
            print(f"Error finding user by email: {e}")
            return None

    @staticmethod
    def find_by_id(user_id):
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            user_data = mongo.db.users.find_one({'_id': user_id})
            if user_data:
                user = User()
                user.email = user_data['email']
                user.name = user_data['name']
                user.password_hash = user_data['password_hash']
                user.is_active = user_data.get('is_active', True)
                user.created_at = user_data.get('created_at', datetime.utcnow())
                user.updated_at = user_data.get('updated_at', datetime.utcnow())
                user._id = user_data['_id']
                return user
            return None
        except Exception as e:
            print(f"Error finding user by ID: {e}")
            return None

class UserPreference:
    def __init__(self, user_id, category, preferences):
        self.user_id = user_id
        self.category = category
        self.preferences = preferences
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def save(self):
        try:
            # Update existing or insert new
            mongo.db.user_preferences.update_one(
                {'user_id': self.user_id, 'category': self.category},
                {
                    '$set': {
                        'preferences': self.preferences,
                        'updated_at': datetime.utcnow()
                    },
                    '$setOnInsert': {
                        'user_id': self.user_id,
                        'category': self.category,
                        'created_at': datetime.utcnow()
                    }
                },
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error saving user preference: {e}")
            return False
    
    @staticmethod
    def find_by_user_and_category(user_id, category):
        try:
            doc = mongo.db.user_preferences.find_one({
                'user_id': user_id, 
                'category': category
            })
            if doc:
                pref = UserPreference(doc['user_id'], doc['category'], doc['preferences'])
                pref.created_at = doc.get('created_at', datetime.utcnow())
                pref.updated_at = doc.get('updated_at', datetime.utcnow())
                return pref
            return None
        except Exception as e:
            print(f"Error finding user preference: {e}")
            return None
    
    @staticmethod
    def find_by_user_id(user_id):
        try:
            docs = mongo.db.user_preferences.find({'user_id': user_id})
            preferences = []
            for doc in docs:
                pref = UserPreference(doc['user_id'], doc['category'], doc['preferences'])
                pref.created_at = doc.get('created_at', datetime.utcnow())
                pref.updated_at = doc.get('updated_at', datetime.utcnow())
                preferences.append(pref)
            return preferences
        except Exception as e:
            print(f"Error finding user preferences: {e}")
            return []

class RecipeRequest:
    def __init__(self, user_id, recipe_name, cuisine, dietary_preferences, description=""):
        self.user_id = user_id
        self.recipe_name = recipe_name
        self.cuisine = cuisine
        self.dietary_preferences = dietary_preferences
        self.description = description
        self.status = "pending"
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def save(self):
        try:
            result = mongo.db.recipe_requests.insert_one({
                'user_id': self.user_id,
                'recipe_name': self.recipe_name,
                'cuisine': self.cuisine,
                'dietary_preferences': self.dietary_preferences,
                'description': self.description,
                'status': self.status,
                'created_at': self.created_at,
                'updated_at': self.updated_at
            })
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error saving recipe request: {e}")
            return None
    
    @staticmethod
    def find_by_user(user_id):
        try:
            docs = mongo.db.recipe_requests.find({'user_id': user_id}).sort('created_at', -1)
            requests = []
            for doc in docs:
                req = RecipeRequest(
                    doc['user_id'], 
                    doc['recipe_name'], 
                    doc['cuisine'], 
                    doc['dietary_preferences'],
                    doc.get('description', '')
                )
                req.status = doc.get('status', 'pending')
                req.created_at = doc.get('created_at', datetime.utcnow())
                req.updated_at = doc.get('updated_at', datetime.utcnow())
                requests.append(req)
            return requests
        except Exception as e:
            print(f"Error finding recipe requests: {e}")
            return []

def test_mongodb_connection():
    """Test MongoDB connection"""
    try:
        if mongo.client:
            mongo.client.admin.command('ping')
            print("MongoDB connection successful!")
            return True
        else:
            print("MongoDB client not initialized")
            return False
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False

def initialize_mongodb():
    """Initialize MongoDB collections and indexes"""
    try:
        # Create indexes for better performance
        mongo.db.users.create_index("email", unique=True)
        mongo.db.user_preferences.create_index([("user_id", 1), ("category", 1)], unique=True)
        print("MongoDB indexes created successfully!")
        return True
    except Exception as e:
        print(f"Error creating MongoDB indexes: {e}")
        return False

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    print("Setting up MongoDB database...")
    
    # Test MongoDB connection
    if test_mongodb_connection():
        # Initialize indexes
        initialize_mongodb()
    else:
        print("Failed to connect to MongoDB. Please check your MongoDB setup.")
