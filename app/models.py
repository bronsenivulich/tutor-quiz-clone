from app import login
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from app import db
from flask_login import UserMixin

@login.user_loader
def load_user(id):
    return User.query.get(int(id))


class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tutorId = db.Column(db.Integer, db.ForeignKey('user.id'))
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'))


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userName = db.Column(db.String(64), index=True, unique=True)
    firstName = db.Column(db.String(64))
    lastName = db.Column(db.String(64))
    email = db.Column(db.String(120), index=True, unique=True)
    passwordHash = db.Column(db.String(128))
    userType = db.Column(db.Integer, db.ForeignKey('user_type.id'))
    students = db.relationship("User",secondary="job",primaryjoin=id==Job.tutorId,secondaryjoin=id==Job.studentId,backref="tutor")
    tutors = db.relationship("User",secondary="job",primaryjoin=id==Job.studentId,secondaryjoin=id==Job.tutorId,backref="student")
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



class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(140)) # TODO Change later
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    userId = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f"<User {self.body}>"

class UserType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userType = db.Column(db.String(64))

    def __repr__(self):
        return f"<User {self.userType}>"
