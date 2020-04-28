from datetime import datetime
from app import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    quizzes = db.relationship('Quiz', backref='creator', lazy='dynamic')

    def __repr__(self):
        return f"<User {self.username}"


class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(140)) # TODO Change later
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f"<User {self.body}"