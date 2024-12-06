from flask import Blueprint, render_template, request, jsonify, current_app

main_routes = Blueprint('main_routes', __name__)

@main_routes.route('/')
def index():
    return render_template('index.html')

@main_routes.route('/game')
def game():
    return render_template('game.html')

@main_routes.route('/game-state', methods=['GET', 'POST'])
def game_state():
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

@main_routes.route('/player-progress', methods=['GET', 'POST'])
def player_progress():
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