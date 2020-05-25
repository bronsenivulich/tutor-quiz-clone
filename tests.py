#!flask/bin/python
import os
import unittest

from config import basedir
from app import app, db
from app.models import User

class TestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'test.db')
        self.app = app.test_client()
        print(app.config['SQLALCHEMY_DATABASE_URI'])
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_unique_username(self):
        u = User(username="foo", email="user@example.com")
        db.session.add(u)
        db.session.commit()
        username = "bar"
        assert username != User.query.filter_by(email="user@example.com").first().username


if __name__ == '__main__':
    unittest.main()