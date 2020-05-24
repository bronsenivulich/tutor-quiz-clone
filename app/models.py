import jwt
import base64
import os
from app import login
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from app import db
from flask_login import UserMixin
from time import time
from app import app

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# Model to hold the accepted tutor requests
class UserRelationship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tutorId = db.Column(db.Integer, db.ForeignKey('user.id'))
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f"<User {self.tutorId}>"

# Model to hold tutor requests to students
class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tutorId = db.Column(db.Integer, db.ForeignKey('user.id'))
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'))
    request = db.Column(db.String(64))

    # Change request staus if accepted
    def accept(self):
        self.request = "accepted"

    # Change request status if declined
    def decline(self):
        self.request = "declined"

    # Turn model to a dictionary for JSON
    def to_dict(self):
        data = {
            'id': self.id,
            'tutorId': self.tutorId,
            'studentId': self.studentId,
            'request': self.request
        }
        return data

# Model to hold user information
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    firstName = db.Column(db.String(64))
    lastName = db.Column(db.String(64))
    email = db.Column(db.String(120), index=True, unique=True)
    passwordHash = db.Column(db.String(128))
    userType = db.Column(db.Integer, db.ForeignKey('user_type.id'))
    token = db.Column(db.String(32), index=True, unique=True)
    token_expiration = db.Column(db.DateTime)
    students = db.relationship("User",secondary="user_relationship",primaryjoin=id==UserRelationship.tutorId,secondaryjoin=id==UserRelationship.studentId,backref="tutor")
    tutors = db.relationship("User",secondary="user_relationship",primaryjoin=id==UserRelationship.studentId,secondaryjoin=id==UserRelationship.tutorId,backref="student")
    quizzes = db.relationship('Quiz', backref='creator', lazy='dynamic')

    def __repr__(self):
        return f"<User {self.username}>"

    # Make password save as a hash for security
    def set_password(self, password):
        self.passwordHash = generate_password_hash(password)

    # Comparison for checking if password is correct
    def check_password(self, password):
        return check_password_hash(self.passwordHash, password)

    # Gets student tocken which expires after an hour, at which a new token is allocated
    def get_token(self, expires_in=3600):
        now = datetime.utcnow()
        if self.token and self.token_expiration > now + timedelta(seconds=60):
            return self.token
        self.token = base64.b64encode(os.urandom(24)).decode('utf-8')
        self.token_expiration = now + timedelta(seconds=expires_in)
        db.session.add(self)
        db.session.commit()
        return self.token

    # Removes expired token
    def revoke_token(self):
        self.token_expiration = datetime.utcnow() - timedelta(seconds=1)

    # Check user token
    @staticmethod
    def check_token(token):
        user = User.query.filter_by(token=token).first()
        if user is None or user.token_expiration < datetime.utcnow():
            return None
        return user

    # Set user_type as foreign_key for userType
    def set_userType(self, userType):
        self.userType =  UserType.query.filter_by(userType=userType).first().id

    def get_userType(self):
        return UserType.query.filter_by(id=self.userType).first().userType

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

# Model to hold if a user is a student or a tutor
class UserType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userType = db.Column(db.String(64))

    def __repr__(self):
        return f"<User {self.userType}>"

# Model to hold quiz information
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(140))
    body = db.Column(db.String(140)) # TODO Change later
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    tutorId = db.Column(db.Integer, db.ForeignKey('user.id'))

    # Turns model information into a dictionary for JSON
    def to_dict(self):
        data = {
            'id': self.id,
            'name': self.name,
            'body': self.body,
            'timestamp': self.timestamp,
            'tutorId': self.tutorId,
        }
        return data

    # Turns JSON dictionary to readable data for the model
    def from_dict(self, data, new_quiz=False):
        for field in ['name', 'body']:
            if field in data:
                setattr(self, field, data[field])

    def __repr__(self):
        return f"<User {self.body}>"

# Model to hold quiz assignment 
class StudentQuiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quizId = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'))

    # Turns JSON dictionary to readable data for the model
    def from_dict(self, data):
        for field in ['quizId', 'studentId']:
            if field in data:
                setattr(self, field, data[field])

    def __repr__(self):
        return f"<User {self.quizId}>"

# Model to hold qusetion information
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quizId = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    question = db.Column(db.String(140))

    # Turns JSON dictionary to readable data for the model
    def from_dict(self, data, new_question=False):
        for field in ['quizId', 'question']:
            if field in data:
                setattr(self, field, data[field])
    
    def __repr__(self):
        return f"<User {self.question}>"

# Model to hold the possible multiple choice question answers
class MultiSolution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    questionId = db.Column(db.Integer, db.ForeignKey('question.id'))
    possibleAnswer = db.Column(db.String(104))
    correctAnswer = db.Column(db.Boolean(name='ck_multi_answer_boolean'))

    # Turns JSON dictionary into readable data for model
    def from_dict(self, data, new_answer=False):
        for field in ['questionId', 'possibleAnswer', 'correctAnswer']:
            if field in data:
                setattr(self, field, data[field])

    def __repr__(self):
        return f"<User {self.possibleAnswer}>"

# Model to hold correct short answers
class ShortAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    correctAnswer = db.Column(db.String(140))
    questionId = db.Column(db.Integer, db.ForeignKey('question.id'))

    # Turns JSON dictionary into readable data for Model
    def from_dict(self, data, new_answer=False):
        for field in ['correctAnswer', 'questionId']:
            if field in data:
                setattr(self, field, data[field])

    def __repr__(self):
        return f"<User {self.correctAnswer}>"

# Model to hold student's input answers
class ShortSolution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    studentQuizId = db.Column(db.Integer, db.ForeignKey('student_quiz.id'))
    questionId = db.Column(db.Integer, db.ForeignKey('question.id'))
    studentAnswer = db.Column(db.String(140))

    def __repr__(self):
        return f"<User {self.studentAnswer}>"

# Model to hold students scores 
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    studentQuizId = db.Column(db.Integer, db.ForeignKey('student_quiz.id'))
    score = db.Column(db.String(32))

    def __repr__(self):
        return f"<User {self.score}>"