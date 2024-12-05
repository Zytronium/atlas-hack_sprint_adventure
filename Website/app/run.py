from app import create_app
from api.routes import routes

app = create_app()
app.register_blueprint(routes, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)