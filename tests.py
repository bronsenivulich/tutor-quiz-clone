#!flask/bin/python
import os
import unittest

from config import basedir
from app import app, db
from app.models import User, Quiz, UserRelationship, StudentQuiz, Question, ShortAnswer, MultiSolution, ShortSolution, Score

class TestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'test.db')
        self.app = app.test_client()
        print(app.config['SQLALCHEMY_DATABASE_URI'])
        db.create_all()
        testTutor = User(id=1,username="test_tutor", userType=1)
        testStudent = User(id=2, username="test_student", userType=2)
        userRelationship = UserRelationship(tutorId=1, studentId=2)
        quiz = Quiz(name="Test Quiz", body="Test Body",tutorId=1)
        db.session.add(testTutor)
        db.session.add(testStudent)
        db.session.add(userRelationship)
        db.session.add(quiz)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_quiz_tutor_id(self):

        quiz = Quiz.query.filter_by(name="Test Quiz").first()
        tutor = User.query.filter_by(username="test_tutor").first()

        assert quiz.tutorId == tutor.id

    def test_quiz_student_access(self):
        quiz = Quiz.query.filter_by(name="Test Quiz").first()
        student = User.query.filter_by(username="test_student").first()
        studentQuiz = StudentQuiz(quizId=1, studentId=2)
        db.session.add(studentQuiz)
        db.session.commit()

        assert student.id == User.query.filter_by(id=StudentQuiz.query.filter_by(quizId=1,studentId=2).first().studentId).first().id


    def test_short_answer_questio(self):
        question = Question(id=1, quizId=1,question="What is 1+1?")
        shortAnswer = ShortAnswer(questionId=1, correctAnswer="2")
        db.session.add(question)
        db.session.add(shortAnswer)
        db.session.commit()

        assert "2" == shortAnswer.query.filter_by(questionId=question.id).first().correctAnswer


    def test_multi_choice_question(self):
        question = Question(id=1, quizId=1,question="What is 1+1?")
        multiChoiceA = MultiSolution(questionId=1, possibleAnswer="2", correctAnswer=True)
        multiChoiceB = MultiSolution(questionId=1, possibleAnswer="100", correctAnswer=False)
        db.session.add(question)
        db.session.add(multiChoiceA)
        db.session.add(multiChoiceB)
        db.session.commit()

        correctAnswer = multiChoiceA.id
        incorrectAnswer = multiChoiceB.id

        assert (MultiSolution.query.filter_by(questionId=question.id,correctAnswer=True).first().id == correctAnswer) and \
            MultiSolution.query.filter_by(questionId=question.id,correctAnswer=False).first().id == incorrectAnswer


    def test_completed_quiz(self):
        quiz = Quiz.query.filter_by(name="Test Quiz").first()
        student = User.query.filter_by(username="test_student").first()
        studentQuiz = StudentQuiz(quizId=1, studentId=2)
        question = Question(id=1, quizId=1,question="What is 1+1?")
        shortAnswer = ShortAnswer(id=1, questionId=1, correctAnswer="2")
        shortSolution = ShortSolution(studentAnswer="2", questionId=1, studentQuizId=1)
        score = Score(score="1/1",studentQuizId=1)
        db.session.add(studentQuiz)
        db.session.add(question)
        db.session.add(shortAnswer)
        db.session.add(shortSolution)
        db.session.add(score)
        db.session.commit()


        assert Score.query.filter_by(studentQuizId=StudentQuiz.query.filter_by(quizId=quiz.id,studentId=student.id).first().id).first() is not None

    def test_adding_second_student(self):
        quiz = Quiz.query.filter_by(name="Test Quiz").first()
        student = User.query.filter_by(username="test_student").first()
        studentQuiz = StudentQuiz(quizId=1, studentId=2)
        db.session.add(studentQuiz)
        db.session.commit()

        studentTwo = User(id=3, username="test_student2", userType=2)
        db.session.add(studentTwo)
        db.session.commit()
        studentQuizTwo = StudentQuiz(quizId=1, studentId=3)
        db.session.add(studentQuizTwo)
        db.session.commit()

        assert StudentQuiz.query.filter_by(quizId=quiz.id,studentId=student.id).first() is not None and StudentQuiz.query.filter_by(quizId=quiz.id,studentId=studentTwo.id).first() is not None

    def test_(self):
        

if __name__ == '__main__':
    unittest.main()