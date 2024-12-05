import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask

def create_app():
    app = Flask(__name__)
    
    # Initialize Firebase
    cred = credentials.Certificate('config/firebase_credentials.json')
    firebase_admin.initialize_app(cred)
    
    # Initialize Firestore
    db = firestore.client()
    app.config['FIRESTORE'] = db
    
    # Import routes
    from . import routes
    
    return app