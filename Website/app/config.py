import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    FIREBASE_CREDENTIALS = os.environ.get('FIREBASE_CREDENTIALS_PATH')
    JWT_EXPIRATION_DELTA = 24  # hours