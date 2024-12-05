from flask import Blueprint, request, jsonify
from app.services.firebase_service import FirebaseService
from app.utils.web_auth import web_token_required
from app.config import Config
from firebase_admin import firestore

api_bp = Blueprint('api', __name__)
db = FirebaseService.get_db(Config.FIREBASE_CREDENTIALS)

@api_bp.route('/<collection>', methods=['GET'])
@web_token_required
def get_documents(collection):
    try:
        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Filtering parameters
        filters = request.args.get('filters', {})
        if isinstance(filters, str):
            filters = eval(filters)  # Caution: use safely in production
        
        # Sorting
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Base query
        query = db.collection(collection)
        
        # Apply filters
        for key, value in filters.items():
            query = query.where(key, '==', value)
        
        # Apply sorting
        query = query.order_by(sort_by, direction=firestore.Query.DESCENDING if sort_order == 'desc' else firestore.Query.ASCENDING)
        
        # Pagination
        docs = query.limit(per_page).offset((page-1) * per_page).stream()
        
        results = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            results.append(doc_dict)
        
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/<collection>', methods=['POST'])
@web_token_required
def create_document(collection):
    try:
        data = request.json
        data['created_at'] = firestore.SERVER_TIMESTAMP
        
        doc_ref = db.collection(collection).document()
        doc_ref.set(data)
        
        return jsonify({
            'message': 'Document created successfully',
            'id': doc_ref.id
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/<collection>/<doc_id>', methods=['PUT'])
@web_token_required
def update_document(collection, doc_id):
    try:
        data = request.json
        data['updated_at'] = firestore.SERVER_TIMESTAMP
        
        doc_ref = db.collection(collection).document(doc_id)
        doc_ref.update(data)
        
        return jsonify({'message': 'Document updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/<collection>/<doc_id>', methods=['DELETE'])
@web_token_required
def delete_document(collection, doc_id):
    try:
        db.collection(collection).document(doc_id).delete()
        return jsonify({'message': 'Document deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500