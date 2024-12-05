import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Web-specific configuration
    SECRET_KEY = os.environ.get('SECRET_KEY')
    ALLOWED_WEBSITE = os.environ.get('ALLOWED_WEBSITE', 'https://yourwebsite.com')
    FIREBASE_CREDENTIALS = os.environ.get('FIREBASE_CREDENTIALS_PATH')
    
    # JWT Configuration
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION = 24  # hours