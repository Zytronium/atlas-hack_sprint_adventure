import firebase_admin
from firebase_admin import credentials, firestore

class FirebaseService:
    _instance = None

    def __new__(cls, credentials_path=None):
        if not cls._instance:
            if credentials_path:
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred)
            cls._instance = firestore.client()
        return cls._instance

    @classmethod
    def get_db(cls, credentials_path=None):
        return cls(credentials_path)