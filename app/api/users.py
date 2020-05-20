from app import db
from app.api import bp
from app.api.errors import bad_request
from app.api.auth import token_auth
from app.models import UserRelationship, Request
from flask import jsonify, request, url_for


@bp.route('/users/request', methods=['POST'])
@token_auth.login_required(role="student")
def accept_request():
    # data ={requestId: 1, accept: true}
    data = request.get_json() or {}

    tutorRequest = Request.query.filter_by(id=data["requestId"]).first()
    print(data)
    print("before")
    if bool(data["accept"]) == True:
        print("True")
        print(tutorRequest.studentId, tutorRequest.tutorId)
        tutorRequest.accept()
        userRelationship = UserRelationship()
        userRelationship.studentId = tutorRequest.studentId
        userRelationship.tutorId = tutorRequest.tutorId
        db.session.add(userRelationship)
        db.session.commit()

    else:
        tutorRequest.decline()

    db.session.add(tutorRequest)
    db.session.commit()
    response = jsonify(tutorRequest.to_dict())
    response.status_code = 201
    # response.headers["Location"] = url_for('api.get_request', id=tutorRequest.id)
    return response