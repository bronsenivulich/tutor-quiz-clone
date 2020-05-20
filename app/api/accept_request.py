from app import db
from app.api import bp
from app.api.errors import bad_request
from app.api.auth import token_auth
from app.models import UserRelationship, Request
from flask import jsonify, request, url_for


@bp.route('/accept_request', methods=['POST'])
@token_auth.login_required(role="student")
def accept_request():
    data = Request.get_json() or {}
    request = Request()
    request.from_dict(data, accept_request=True)
    db.session.add(request)
    db.session.commit()
    response = jsonify(request.to_dict())
    response.status_code = 201
    response.headers["Location"] = url_for('api.get_request', id=request.id)
    return data