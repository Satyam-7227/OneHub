#!/usr/bin/env python3
import pymongo
from pymongo import MongoClient

def test_mongodb_connection():
    try:
        # Connect to MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get server info
        server_info = client.server_info()
        print(f"✅ MongoDB version: {server_info['version']}")
        
        # List databases
        db_list = client.list_database_names()
        print(f"✅ Available databases: {db_list}")
        
        # Test our database
        db = client.dashboard_db
        print(f"✅ Connected to database: dashboard_db")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
