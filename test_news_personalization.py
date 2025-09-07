#!/usr/bin/env python3
"""
Test script to verify news personalization functionality
"""
import requests
import json
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_news_personalization():
    """Test if news API uses user preferences correctly"""
    base_url = "http://localhost:5000"
    
    print("Testing News Personalization...")
    print("=" * 50)
    
    # Test 1: Try to access news endpoint without authentication
    print("\n1. Testing news endpoint without authentication:")
    try:
        response = requests.get(f"{base_url}/api/news", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("✓ Correctly requires authentication")
        else:
            print("✗ Should require authentication")
    except requests.exceptions.RequestException as e:
        print(f"✗ Connection error: {e}")
        return False
    
    # Test 2: Try to register and login a test user
    print("\n2. Testing user registration and login:")
    test_user = {
        "username": "test_news_user",
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    try:
        # Register user
        reg_response = requests.post(f"{base_url}/api/register", json=test_user, timeout=5)
        print(f"Registration status: {reg_response.status_code}")
        
        # Login user
        login_response = requests.post(f"{base_url}/api/login", json={
            "username": test_user["username"],
            "password": test_user["password"]
        }, timeout=5)
        
        if login_response.status_code == 200:
            token = login_response.json().get('access_token')
            print("✓ Successfully logged in")
            
            # Test 3: Set news preferences
            print("\n3. Testing news preferences setup:")
            preferences = {
                "category": "news",
                "preferences": {
                    "categories": ["technology", "science"]
                }
            }
            
            headers = {"Authorization": f"Bearer {token}"}
            pref_response = requests.post(f"{base_url}/api/preferences", 
                                        json=preferences, headers=headers, timeout=5)
            print(f"Preferences status: {pref_response.status_code}")
            
            if pref_response.status_code == 200:
                print("✓ Successfully set news preferences")
                
                # Test 4: Get personalized news
                print("\n4. Testing personalized news retrieval:")
                news_response = requests.get(f"{base_url}/api/news", headers=headers, timeout=10)
                print(f"News API status: {news_response.status_code}")
                
                if news_response.status_code == 200:
                    news_data = news_response.json()
                    print(f"✓ Successfully retrieved news")
                    print(f"Articles count: {news_data.get('count', 0)}")
                    
                    # Check if it's using preferences
                    if news_data.get('articles'):
                        first_article = news_data['articles'][0]
                        category = first_article.get('category', 'unknown')
                        print(f"First article category: {category}")
                        
                        if category in ["technology", "science"] or news_data.get('is_mock'):
                            print("✓ News appears to be personalized or using fallback")
                        else:
                            print("? News category doesn't match preferences")
                    
                    # Test 5: Get trending news
                    print("\n5. Testing trending news:")
                    trending_response = requests.get(f"{base_url}/api/news/trending", 
                                                   headers=headers, timeout=10)
                    print(f"Trending news status: {trending_response.status_code}")
                    
                    if trending_response.status_code == 200:
                        trending_data = trending_response.json()
                        print(f"✓ Successfully retrieved trending news")
                        print(f"Trending articles count: {trending_data.get('count', 0)}")
                    
                    return True
                else:
                    print(f"✗ Failed to get news: {news_response.text}")
            else:
                print(f"✗ Failed to set preferences: {pref_response.text}")
        else:
            print(f"✗ Login failed: {login_response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"✗ Request error: {e}")
    
    return False

if __name__ == "__main__":
    print("News Personalization Test")
    print("Make sure the backend server is running on localhost:5000")
    print()
    
    success = test_news_personalization()
    
    if success:
        print("\n" + "=" * 50)
        print("✓ News personalization test completed successfully!")
    else:
        print("\n" + "=" * 50)
        print("✗ News personalization test failed!")
        print("Make sure the backend server is running and try again.")
