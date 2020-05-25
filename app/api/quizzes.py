from app import db
from app.api import bp
from app.api.errors import bad_request
from app.api.auth import token_auth
from app.models import User, UserType, Quiz, Question, ShortAnswer, StudentQuiz, MultiSolution, Score, ShortSolution
from flask import jsonify, request, url_for

@bp.route('/quizzes/<int:id>', methods=['GET'])
@token_auth.login_required()
def get_quiz(id):
    quiz = Quiz.query.filter_by(id=id).first()

    token = request.headers["Authorization"].replace("Bearer ","")
    user = User.query.filter_by(token=token).first()
    
    

    responseData = {}
    responseData["name"] = quiz.name
    responseData["body"] = quiz.body
    responseData["tutorId"] = quiz.tutorId


    questions = Question.query.filter_by(quizId=id)
    questionsToSend = []
    for question in questions:
        if ShortAnswer.query.filter_by(questionId=question.id).first() is not None:
            questionToSend = {}
            questionToSend["questionType"] = "shortAnswer"
            questionToSend["question"] = question.question
            questionToSend["questionId"] = question.id
            questionToSend["shortAnswerId"] = ShortAnswer.query.filter_by(questionId=question.id).first().id
            if UserType.query.filter_by(id=user.userType).first().userType == "tutor":
                questionToSend["currentAnswer"] = ShortAnswer.query.filter_by(questionId=question.id).first().correctAnswer

        elif MultiSolution.query.filter_by(questionId=question.id).first() is not None:
            questionToSend = {}
            questionToSend["questionType"] = "multiSolution"
            questionToSend["question"] = question.question
            questionToSend["questionId"] = question.id
            multiSolutions = MultiSolution.query.filter_by(questionId=question.id)
            choices = []
            for multiSolution in multiSolutions:
                choice = {}
                choice["answer"] = multiSolution.possibleAnswer
                choice["choiceId"] = multiSolution.id
                if UserType.query.filter_by(id=user.userType).first().userType == "tutor":
                    choice["isCorrect"] = multiSolution.correctAnswer
                choices.append(choice)
            questionToSend["options"] = choices
        questionsToSend.append(questionToSend)

    responseData["questions"] = questionsToSend

    return responseData


@bp.route('/quizzes/completed/<int:id>', methods=['GET'])
@token_auth.login_required()
def get_completed_quiz(id):

    studentQuiz = StudentQuiz.query.filter_by(id=id).first()
    quiz = Quiz.query.filter_by(id=studentQuiz.quizId).first()

    token = request.headers["Authorization"].replace("Bearer ","")
    user = User.query.filter_by(token=token).first()
    
    
    if quiz.tutorId != user.id and studentQuiz.studentId != user.id:
        resp = {"MSG":"You are not allowed to view this quiz."}
        return resp

    
    responseData = {}
    responseData["name"] = quiz.name
    responseData["body"] = quiz.body
    responseData["tutorId"] = quiz.tutorId

    questions = Question.query.filter_by(quizId=quiz.id)
    questionsToSend = []
    for question in questions:
        if ShortAnswer.query.filter_by(questionId=question.id).first() is not None:
            questionToSend = {}
            questionToSend["questionType"] = "shortAnswer"
            questionToSend["question"] = question.question
            questionToSend["questionId"] = question.id
            questionToSend["answer"] = ShortAnswer.query.filter_by(questionId=question.id).first().correctAnswer
            questionToSend["submittedAnswer"] = ShortSolution.query.filter_by(questionId=question.id, studentQuizId=studentQuiz.id).first().studentAnswer
        elif MultiSolution.query.filter_by(questionId=question.id).first() is not None:
            questionToSend = {}
            questionToSend["questionType"] = "multiSolution"
            questionToSend["question"] = question.question
            questionToSend["questionId"] = question.id
            questionToSend["answers"] = [mc.possibleAnswer for mc in MultiSolution.query.filter_by(questionId=question.id,correctAnswer=True).all()]
            questionToSend["submittedAnswer"] = MultiSolution.query.filter_by(id=ShortSolution.query.filter_by(questionId=question.id, studentQuizId=studentQuiz.id).first().studentAnswer).first().possibleAnswer
        questionsToSend.append(questionToSend)

    responseData["questions"] = questionsToSend

    return responseData

@bp.route('/quizzes/create', methods=['POST'])
@token_auth.login_required(role="tutor")
def create_quiz():
    data = request.get_json() or {}
    if 'name' not in data or 'body' not in data or 'questions' not in data:
        return bad_request('must include quiz name, body and questions fields')
    quiz = Quiz()
    quiz.from_dict(data, new_quiz=True)
    token = request.headers["Authorization"].replace('Bearer ', '')
    tutorId = User.check_token(token).id
    studentName = data["studentName"]
    quiz.tutorId = tutorId
    db.session.add(quiz)
    db.session.commit()
    for questionAndAnswer in data["questions"]:
        if questionAndAnswer["questionType"] == "shortAnswer":
            question_data = {}
            question_data["question"] = questionAndAnswer["question"]
            question_data["quizId"] = quiz.id
            question = Question()
            question.from_dict(question_data, new_question=True)
            db.session.add(question)
            db.session.commit()
            answer_data = {}
            answer_data["correctAnswer"] = questionAndAnswer["answer"]
            answer_data["questionId"] = question.id
            shortAnswer = ShortAnswer()
            shortAnswer.from_dict(answer_data, new_answer=True)
            db.session.add(shortAnswer)
            db.session.commit()
        elif questionAndAnswer["questionType"] == "multiSolution":
            question_data = {}
            question_data["question"] = questionAndAnswer["question"]
            question_data["quizId"] = quiz.id
            question = Question()
            question.from_dict(question_data, new_question=True)
            db.session.add(question)
            db.session.commit()
            for option in questionAndAnswer["options"]:
                print(option)
                answer_data = {}
                answer_data["questionId"] = question.id
                answer_data["possibleAnswer"] = option["answer"]
                answer_data["correctAnswer"] = bool(option["isTrue"])
                multiSolution = MultiSolution()
                multiSolution.from_dict(answer_data, new_answer=True)
                db.session.add(multiSolution)
                db.session.commit()

    
    studentQuiz = StudentQuiz()
    studentQuiz.quizId = quiz.id
    studentQuiz.studentId = User.query.filter_by(username=studentName).first().id
    db.session.add(studentQuiz)
    db.session.commit()
    response = jsonify(quiz.to_dict())
    response.status_code = 201
    response.headers["Location"] = url_for('api.get_quiz', id=quiz.id)
    return data


@bp.route('/quizzes/edit/<int:id>', methods=['POST'])
@token_auth.login_required(role="tutor")
def edit_quiz(id):
    data = request.get_json() or {}
    if 'name' not in data or 'body' not in data or 'questions' not in data:
        return bad_request('must include quiz name, body and questions fields')
    quiz = Quiz.query.filter_by(id=id).first()
    quiz.name = data["name"]
    quiz.body = data["body"]
    # token = request.headers["Authorization"].replace('Bearer ', '')
    db.session.add(quiz)
    db.session.commit()
    for questionAndAnswer in data["questions"]:
        if "questionId" in questionAndAnswer:
            if questionAndAnswer["questionType"] == "shortAnswer":
                question = Question.query.filter_by(id=questionAndAnswer["questionId"]).first()
                question.question = questionAndAnswer["question"]
                shortAnswer = ShortAnswer.query.filter_by(id=questionAndAnswer["shortAnswerId"]).first()
                shortAnswer.correctAnswer = questionAndAnswer["answer"]
                db.session.add(question, shortAnswer)
                db.session.commit()
            elif questionAndAnswer["questionType"] == "multiSolution":
                question = Question.query.filter_by(id=questionAndAnswer["questionId"]).first()
                question.question = questionAndAnswer["question"]
                db.session.add(question)
                db.session.commit()
                options = questionAndAnswer["options"]
                for option in options:
                    multiSolution = MultiSolution.query.filter_by(id=option["choiceId"]).first()
                    multiSolution.possibleAnswer = option["answer"]
                    multiSolution.correctAnswer = bool(option["isTrue"])
                    db.session.add(multiSolution)
                    db.session.commit()

        else:
            print(questionAndAnswer)
            if questionAndAnswer["questionType"] == "shortAnswer":
                question_data = {}
                question_data["question"] = questionAndAnswer["question"]
                question_data["quizId"] = quiz.id
                question = Question()
                question.from_dict(question_data, new_question=True)
                db.session.add(question)
                db.session.commit()
                answer_data = {}
                answer_data["correctAnswer"] = questionAndAnswer["answer"]
                answer_data["questionId"] = question.id
                shortAnswer = ShortAnswer()
                shortAnswer.from_dict(answer_data, new_answer=True)
                db.session.add(shortAnswer)
                db.session.commit()
            elif questionAndAnswer["questionType"] == "multiSolution":
                question_data = {}
                question_data["question"] = questionAndAnswer["question"]
                question_data["quizId"] = quiz.id
                question = Question()
                question.from_dict(question_data, new_question=True)
                db.session.add(question)
                db.session.commit()
                for option in questionAndAnswer["options"]:
                    answer_data = {}
                    answer_data["questionId"] = question.id
                    answer_data["possibleAnswer"] = option["answer"]
                    answer_data["correctAnswer"] = bool(option["isTrue"])
                    multiSolution = MultiSolution()
                    multiSolution.from_dict(answer_data, new_answer=True)
                    db.session.add(multiSolution)
                    db.session.commit()
    
    # studentQuiz = StudentQuiz()
    # studentQuiz.quizId = quiz.id
    # studentQuiz.studentId = User.query.filter_by(username=studentName).first().id
    # db.session.add(studentQuiz)
    # db.session.commit()
    response = jsonify(quiz.to_dict())
    response.status_code = 201
    response.headers["Location"] = url_for('api.get_quiz', id=quiz.id)
    return data

@bp.route('/quizzes/submit/<int:id>', methods=['POST'])
@token_auth.login_required(role="student")
def submit_quiz(id):
    data = request.get_json() or {}
    quizId = id
    token = request.headers["Authorization"].replace('Bearer ', '')
    studentId = User.check_token(token).id
    studentQuiz = StudentQuiz.query.filter_by(quizId=quizId,studentId=studentId).first()
    totalQuestions = 0
    totalScore = 0
    for answer in data["answers"]:
        totalQuestions += 1
        if answer["questionType"] == "shortAnswer":
            question = Question.query.filter_by(id=answer["questionId"]).first()
            shortAnswer = ShortAnswer.query.filter_by(questionId=question.id).first()
            shortSolution = ShortSolution()
            shortSolution.questionId = answer["questionId"]
            shortSolution.studentQuizId = studentQuiz.id
            shortSolution.studentAnswer = answer["studentAnswer"]
            db.session.add(shortSolution)
            db.session.commit()
            if answer["studentAnswer"] == shortAnswer.correctAnswer:
                totalScore = totalScore + 1
        elif answer["questionType"] == "multiSolution":
            multiSolution = MultiSolution.query.filter_by(id=answer["studentAnswer"]).first()
            shortSolution = ShortSolution()
            shortSolution.questionId = answer["questionId"]
            shortSolution.studentQuizId = studentQuiz.id
            shortSolution.studentAnswer = answer["studentAnswer"]
            db.session.add(shortSolution)
            db.session.commit()
            if multiSolution.correctAnswer == True:
                totalScore += 1

    score = Score()
    score.studentQuizId = studentQuiz.id
    score.score = f"{totalScore}/{totalQuestions}"
    db.session.add(score)
    db.session.commit()

    resp = {
        "totalQuestions":totalQuestions,
        "totalScore":totalScore
    }

    return resp