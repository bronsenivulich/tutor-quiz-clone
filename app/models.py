from app import login
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from app import db
from flask_login import UserMixin
from time import time
import jwt
from app import app

@login.user_loader
def load_user(id):
    return User.query.get(int(id))


class UserRelationship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tutorId = db.Column(db.Integer, db.ForeignKey('user.id'))
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f"<User {self.tutorId}>"

class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tutorId = db.Column(db.Integer, db.ForeignKey('user.id'))
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'))
    request = db.Column(db.String(64))


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userName = db.Column(db.String(64), index=True, unique=True)
    firstName = db.Column(db.String(64))
    lastName = db.Column(db.String(64))
    email = db.Column(db.String(120), index=True, unique=True)
    passwordHash = db.Column(db.String(128))
    userType = db.Column(db.Integer, db.ForeignKey('user_type.id'))
    students = db.relationship("User",secondary="user_relationship",primaryjoin=id==UserRelationship.tutorId,secondaryjoin=id==UserRelationship.studentId,backref="tutor")
    tutors = db.relationship("User",secondary="user_relationship",primaryjoin=id==UserRelationship.studentId,secondaryjoin=id==UserRelationship.tutorId,backref="student")
    quizzes = db.relationship('Quiz', backref='creator', lazy='dynamic')

    def __repr__(self):
        return f"<User {self.userName}>"

    def set_password(self, password):
        self.passwordHash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.passwordHash, password)

    # set user_type as foreign_key for userType
    def set_userType(self, userType):
        self.userType =  UserType.query.filter_by(userType=userType).first().id

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            app.config['SECRET_KEY'], algorithm='HS256').decode('utf-8')

    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, app.config['SECRET_KEY'],
                            algorithms=['HS256'])['reset_password']
        except:
            return
        return User.query.get(id)


class UserType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userType = db.Column(db.String(64))

    def __repr__(self):
        return f"<User {self.userType}>"


class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(140))
    body = db.Column(db.String(140)) # TODO Change later
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    tutorId = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f"<User {self.body}>"

class StudentQuiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quizId = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f"<User {self.quizId}>"

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quizId = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    question = db.Column(db.String(140))

    def __repr__(self):
        return f"<User {self.question}>"

class MultiSolution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    questionId = db.Column(db.Integer, db.ForeignKey('question.id'))
    possibleAnswer = db.Column(db.String(104))
    correctAnswer = db.Column(db.Boolean(name='ck_multi_answer_boolean'))

    def __repr__(self):
        return f"<User {self.possibleAnswer}>"

class ShortAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    correctAnswer = db.Column(db.String(140))
    questionId = db.Column(db.Integer, db.ForeignKey('question.id'))

    def __repr__(self):
        return f"<User {self.correctAnswer}>"

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    studentQuizId = db.Column(db.Integer, db.ForeignKey('student_quiz.id'))
    score = db.Column(db.Integer)

    def __repr__(self):
        return f"<User {self.score}>"