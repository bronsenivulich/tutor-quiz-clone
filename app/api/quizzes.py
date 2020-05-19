from app import db
from app.api import bp
from app.api.errors import bad_request
from app.api.auth import token_auth
from app.models import Quiz, Question, ShortAnswer
from flask import jsonify, request, url_for


@bp.route('/quizzes/<int:id>', methods=['GET'])
@token_auth.login_required(role="tutor")
def get_quiz(id):
    return jsonify(Quiz.query.get_or_404(id).to_dict())

@bp.route('/quizzes', methods=['POST'])
@token_auth.login_required
def create_quiz():
    data = request.get_json() or {}
    print(data)
    if 'name' not in data or 'body' not in data or 'tutorId' not in data:
        return bad_request('must include username, email and password fields')
    quiz = Quiz()
    quiz.from_dict(data, new_quiz=True)
    db.session.add(quiz)
    db.session.commit()
    for questionAndAnswer in data["questions"]:
        print(questionAndAnswer)
        question_data = {}
        question_data["question"] = questionAndAnswer["question"]
        question_data["quizId"] = quiz.id
        print(question_data)
        question = Question()
        question.from_dict(question_data, new_question=True)
        db.session.add(question)
        db.session.commit()
        answer_data = {}
        answer_data["correctAnswer"] = questionAndAnswer["answer"]
        answer_data["questionId"] = question.id
        print(answer_data)
        shortAnswer = ShortAnswer()
        shortAnswer.from_dict(answer_data, new_answer=True)
        db.session.add(shortAnswer)
        db.session.commit()
    response = jsonify(quiz.to_dict())
    response.status_code = 201
    response.headers["Location"] = url_for('api.get_quiz', id=quiz.id)
    return data