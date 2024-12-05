import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Web-specific configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
    ALLOWED_WEBSITE = 'https://zytronium.github.io'
    
    # Firebase Configuration
    FIREBASE_PROJECT_ID = 'text-adventure-55f7e'
    FIREBASE_REALTIME_DB_URL = 'https://text-adventure-55f7e-default-rtdb.firebaseio.com/'
    
    # JWT Configuration
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION = 24  # hours