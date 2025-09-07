import os
import sys
import subprocess
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

def install_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], 
                      check=True, cwd=Path(__file__).parent)
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def setup_mongodb():
    """Setup MongoDB connection"""
    print("Setting up MongoDB...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv(backend_dir / ".env")
    
    try:
        from backend.database import test_mongodb_connection, initialize_mongodb
        
        print("Testing MongoDB connection...")
        if test_mongodb_connection():
            print("✅ MongoDB connection successful!")
            if initialize_mongodb():
                print("✅ MongoDB indexes created!")
            return True
        else:
            print("❌ MongoDB connection failed!")
            print("Please ensure MongoDB is running on mongodb://localhost:27017/")
            return False
            
    except Exception as e:
        print(f"❌ MongoDB setup failed: {e}")
        print("Please install and start MongoDB server")
        return False

def start_flask_app():
    """Start the Flask application"""
    print("Starting Flask application...")
    try:
        # Change to backend directory and start app
        os.chdir(backend_dir)
        
        # Import and run the app
        from app import app
        
        print("🚀 Starting Flask server on http://localhost:5000")
        print("📱 Frontend should be available on http://localhost:3000")
        print("Press Ctrl+C to stop the server")
        
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        print(f"❌ Failed to start Flask app: {e}")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting Dashboard Application Setup...")
    print("=" * 50)
    
    # Step 1: Install dependencies
    if not install_dependencies():
        print("❌ Setup failed at dependency installation")
        return
    
    # Step 2: Setup MongoDB
    if not setup_mongodb():
        print("❌ Setup failed at MongoDB configuration")
        print("Please install MongoDB and ensure it's running")
        return
    
    print("✅ MongoDB configured successfully!")
    print("=" * 50)
    
    # Step 3: Start Flask app
    start_flask_app()

if __name__ == "__main__":
    main()
