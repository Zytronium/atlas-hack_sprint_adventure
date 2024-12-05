from flask import Blueprint, request, jsonify, current_app, render_template

routes = Blueprint('routes', __name__)

@routes.route('/game-state', methods=['GET', 'POST'])
def handle_game_state():
    db = current_app.config['FIRESTORE']
    
    if request.method == 'GET':
        game_id = request.args.get('game_id')
        game_ref = db.collection('game_states').document(game_id)
        game_state = game_ref.get()
        
        if game_state.exists:
            return jsonify(game_state.to_dict()), 200
        return jsonify({"error": "Game state not found"}), 404
    
    elif request.method == 'POST':
        game_data = request.json
        game_id = game_data.get('game_id')
        
        if not game_id:
            return jsonify({"error": "Game ID is required"}), 400
        
        game_ref = db.collection('game_states').document(game_id)
        game_ref.set(game_data)
        return jsonify({"message": "Game state saved successfully"}), 201

@routes.route('/player-progress', methods=['GET', 'POST'])
def handle_player_progress():
    db = current_app.config['FIRESTORE']
    
    if request.method == 'GET':
        player_id = request.args.get('player_id')
        progress_ref = db.collection('player_progress').document(player_id)
        progress = progress_ref.get()
        
        if progress.exists:
            return jsonify(progress.to_dict()), 200
        return jsonify({"error": "Player progress not found"}), 404
    
    elif request.method == 'POST':
        progress_data = request.json
        player_id = progress_data.get('player_id')
        
        if not player_id:
            return jsonify({"error": "Player ID is required"}), 400
        
        progress_ref = db.collection('player_progress').document(player_id)
        progress_ref.set(progress_data)
        return jsonify({"message": "Player progress updated successfully"}), 201
   
@routes.route('/')
def index():
    print("Hello World")
    return render_template('index.html')