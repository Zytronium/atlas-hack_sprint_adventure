import os
from flask import Flask
from firebase_admin import credentials, firestore, initialize_app
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__, 
                static_folder='static', 
                template_folder='templates')
    
    # Configure secret key
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

    # Initialize Firebase
    try:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": os.getenv('text-adventure-55f7e'),
            "private_key_id": os.getenv('5854172ebdfec209f06e7509824233e6dbf3c1ba'),
            "private_key": os.getenv('\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCquZnqNh1dFhXF\nETiLqJpju1haca7ND4j51032xlOSBo57MCJkd770xycI9qbeGLkc6G7fLbNOaDFv\niP25TbzVVgVjKgd+lFJBNCaWdFBUIdckoL+ZJFYEA91TDIJzWMa3mUJkBxWBKEoh\nCVC24kX3In7SPBbqCGrKYhcrbsAsORKT7vw1Gbi2VjgwLVFHhq8d2cehktwVfu+z\n9OXkH/KBZVKLAgXoRdgwcc4toNRqXBr5gkkJlk3Hd29V7OpMb25BUAuCBckGcdUg\nCqhd2F1wqL6isyRhZ24L3J9tAg+VfX4xMIMx5qrG5l1BuRB7uiD4qWlC42TOOZPO\nJXvbKwXnAgMBAAECggEAKyubm/nrGurGvnpITihoQefRw60Tgo73GBY1hL1JzJcT\n2Fqnl7gf9U2WtVGJiIe/52tu/chUmvMF7So63myl31xNKHIsSvm+gvZo+4qV9XBJ\nMt3jFRp3FbTUdnenVPuR5ENA4oJYEbzaYdg1LMmy33c9knPXZ36RYnPDYBw1Q/kQ\nwu2LgMvPrsCJ/+cVbCE1mn0EPNX3tZi+gbH2DY+eeSl254V7CoDDBJ/7Hc/LqNUT\n+9YPr+h8AWtAofHBZotRCuqLUSf8tGmBGcwvajw+iOa8ce0vqJrBuPfnFgbgjIV1\nTg3sIjDrCoYu3v2iB10Bl7I5lJl9j+uc4Dp+KuXcoQKBgQDaDwlGUTuJKXBCVgWN\nj5bfZaQ5SLRTSrA50ezhonMnlPsM+LvtRkWOqZy7eC9lhjuPW/zLhgcZhyhOrXZY\nh2fPn6yX9eFivp9UCOEEA95VUfaUj2eTxEAVipVKVHLaYlSL+po7Asu6SEumucdb\nZMmPvbdWVLQRx9I18rihs3OjowKBgQDIbi80Rz0HCaac7ZpN9QHjrsbI1acpRSWG\nc5qG49m21FFOo7FjNvtxq13COq5l6/aTok8+xAE1tG0AsZJDCxbzQCOCcZUze3IG\ncjkCXCUGviionPC1Kp4iQbt/o94jCucsHnBO+rCzo5kljSB3p2wCyoz21WvIxt1Q\nNCqy5XnY7QKBgQC2ddp24kYE8Y2jlEM1Pq8p4uzVmgZ5o4dt+kBSVRIyTrD7G650\nTlaplzc0js5qDzYLMReIXW/XZobNvsvGLBcrXhqXVQDxFTxQntVZ/LqvfdPsX0p2\nFMLiw4FEHwGzxo+kSV+AfUhnaVMUAWPVD7Kw+jhMnrfGIQO+bIkdlQDwLQKBgDO1\nmaAXMPt71exusHykVVR0Zvyxgmr3V/MUKC3c4vJ0XHW5ba53JO/ykkHl+dB5zCfS\nnDdJQjak0ep35ZA+cDFZvs+Mlj2t/4ECPwsI0tSmgr7dnoxe7mVQKBuKH2lTCskr\nITZ/Hs95ya0Sd+nm28rsjumvrhsikz559vookgMRAoGBAIwI1ECJC6aft6QVf6wK\noldMh3ZowwmKFsJdrlzd1NjRHGUAewDviLL81K+HCQqjPI9kGgw5ZY3F429edAPb\njJ0fdgimTiIQshAzq5HLZgIT8uTErm7Evw67guDgvIWvtt5rX7KR71EOg8iCuh7F\nEXonKAz7UXdzFZXRdMZPjA/0\n').replace('\\n', '\n'),
            "client_email": os.getenv('firebase-adminsdk-tyi4b@text-adventure-55f7e.iam.gserviceaccount.com'),
            "client_id": os.getenv('118190399587024702849')
        })
        initialize_app(cred, {
            'databaseURL': os.getenv('https://text-adventure-55f7e-default-rtdb.firebaseio.com/')
        })
    except Exception as e:
        print(f"Firebase initialization error: {e}")

    # Initialize Firestore
    firestore_db = firestore.client()
    app.config['FIRESTORE'] = firestore_db

    # Import and register blueprints
    from .routes import main_routes
    from .auth import auth_routes
    app.register_blueprint(main_routes)
    app.register_blueprint(auth_routes)

    return app

# Entry point for running the application
def run():
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    run()