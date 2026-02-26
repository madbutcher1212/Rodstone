from flask import Blueprint, jsonify

clans_bp = Blueprint('clans', __name__)

@clans_bp.route('/create', methods=['POST'])
def create_clan():
    return jsonify({'success': True, 'message': 'Not implemented'})

@clans_bp.route('/top', methods=['GET'])
def top_clans():
    return jsonify({'players': []})
