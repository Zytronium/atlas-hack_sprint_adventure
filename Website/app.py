from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
     return render_template('index.html')

@app.route('/game')
def game():
     return render_template('game.html')

@app.route('/api/game-state', methods=['GET', 'POST'])
def game_state():
     backend_url = 'http://localhost:5000/game-state'
    
     if request.method == 'GET':
         response = requests.get(backend_url, params=request.args)
     else:
         response = requests.post(backend_url, json=request.json)
    
     return jsonify(response.json()), response.status_code

if __name__ == '__main__':
     app.run(debug=True, host='0.0.0.0', port=5000)