from flask import request, jsonify, current_app

def get_game_state(game_id):
    db = current_app.config['FIRESTORE']
    game_ref = db.collection('game_states').document(game_id)
    game_state = game_ref.get()
    
    if game_state.exists:
        return jsonify(game_state.to_dict()), 200
    return jsonify({"error": "Game state not found"}), 404

def save_game_state():
    db = current_app.config['FIRESTORE']
    game_data = request.json
    game_id = game_data.get('game_id')
    
    if not game_id:
        return jsonify({"error": "Game ID is required"}), 400
    
    game_ref = db.collection('game_states').document(game_id)
    game_ref.set(game_data)
    return jsonify({"message": "Game state saved successfully"}), 201