from flask import Blueprint, request, jsonify
from app.services.firebase import FirebaseService
from app.api.utils import token_required
from app.config import Config
from firebase_admin import firestore

api_bp = Blueprint('api', __name__)
db = FirebaseService.get_db(Config.FIREBASE_CREDENTIALS)

@api_bp.route('/<collection>', methods=['GET'])
@token_required
def get_documents(collection):
    try:
        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Filtering parameters
        filters = request.args.get('filters', {})
        if isinstance(filters, str):
            filters = eval(filters)  # Use with caution in production
        
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

# Similar methods for POST, PUT, DELETE as in previous example