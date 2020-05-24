from flask import render_template, flash, redirect, url_for, request
from werkzeug.urls import url_parse
from app import app, db

from app.forms import LoginForm, RegistrationForm, RequestStudentForm, AssignStudentForm
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, UserType, Request, Quiz, Question, ShortAnswer, StudentQuiz, UserRelationship, Score

import os
from flask import send_from_directory

# Landing Page


@app.route('/')
@app.route('/index')
def index():
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    return render_template('index.html', title="Welcome")

# Home Page for User Logged-In


@app.route('/home')
@login_required
def home():
    # Convert UserType.id to userType
    userType = UserType.query.filter_by(id=current_user.userType).first().userType

    # Render student home page
    if userType == "student":
        token = current_user.get_token()
        requests = Request.query.filter_by(studentId=current_user.id, request="pending")
        tutors = UserRelationship.query.filter_by(studentId=current_user.id)

        studentQuizzes = StudentQuiz.query.filter_by(studentId=current_user.id)
        completedQuizzes = []
        uncompletedQuizzes = []
        for studentQuiz in studentQuizzes:
            if Score.query.filter_by(studentQuizId=studentQuiz.id).first() is not None:
                completedQuizzes.append(studentQuiz)
            else :
                uncompletedQuizzes.append(studentQuiz)

        return render_template("home-student.html", title="Home Page", userType=userType, token=token, User=User,
                               requests=requests, tutors=tutors, Quiz=Quiz, completedQuizzes=completedQuizzes,
                               uncompletedQuizzes=uncompletedQuizzes, StudentQuiz=StudentQuiz, Score=Score)

    # Render tutor home page
    elif userType == "tutor":
        students = UserRelationship.query.filter_by(tutorId=current_user.id)
        tutorQuizzes = Quiz.query.filter_by(tutorId=current_user.id)
        token = current_user.get_token()

        completedQuizzes = []
        uncompletedQuizzes = []
        for tutorQuiz in tutorQuizzes:
            studentQuiz = StudentQuiz.query.filter_by(quizId=tutorQuiz.id).first()
            if Score.query.filter_by(studentQuizId=studentQuiz.id).first() is not None:
                completedQuizzes.append(studentQuiz)
            else :
                uncompletedQuizzes.append(studentQuiz)
        for uc in uncompletedQuizzes:
            print("id", uc.id)
    return render_template("home-tutor.html", title="Home Page", userType=userType, token=token,
                           User=User, students=students, tutorQuizzes=tutorQuizzes, StudentQuiz=StudentQuiz,
                           Score = Score, completedQuizzes=completedQuizzes, uncompletedQuizzes=uncompletedQuizzes, Quiz=Quiz)


# Log in page
@app.route('/login', methods=['GET', 'POST'])
def login():

    # Ensure user authentication
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    form = LoginForm()

    # Ensure form is filled correctly
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()

        # Check username and/or passwords are valid
        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password")
            return redirect(url_for("login"))
        login_user(user, remember=form.rememberMe.data)
        next_page = request.args.get("next")
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for("home")
        return redirect(next_page)
    return render_template('login.html', title="Login", form=form)

# Logout the current user
@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("index"))


# Registration page
@app.route('/register', methods=['GET', 'POST'])
def register():

    # Check if current user is authenticated
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()

    # If user is valid, add user to the database
    if form.validate_on_submit():
        user = User(firstName=form.firstName.data, lastName=form.lastName.data, username=form.username.data, email=form.email.data)
        user.set_userType(form.userType.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)


# Request student page
@app.route('/request-student', methods=['GET', 'POST'])
def request_student():

    # Check user authentication
    if current_user.is_authenticated:
        form = RequestStudentForm()
        
        # Add request to the database
        if form.validate_on_submit():
            studentUserName = User.query.filter_by(username=form.student.data).first()
            studentId = studentUserName.id
            request = Request(tutorId=current_user.id, studentId=studentId, request='pending')
            db.session.add(request)
            db.session.commit()
            flash('Your request has been sent')
        return render_template('request.html', title='Request', form=form)

    else:
        return redirect(url_for('index'))

# Create quiz page
@app.route('/quiz/create', methods=['GET'])
def create_quiz():

    # Check user authentication
    if current_user.is_authenticated:

        # Ensure current user is a tutor
        userType = UserType.query.filter_by(
            id=current_user.userType).first().userType
        if userType == "tutor":
            token = current_user.get_token()
            students = UserRelationship.query.filter_by(tutorId=current_user.id)
            return render_template('create-quiz.html', token=token, students=students, User=User)
        else:
            flash("You must be a tutor to create quizzes.")
            return redirect(url_for("home"))
    else: 
        return redirect(url_for('index'))

# Page to assign student to a quiz
@app.route('/assign-student', methods=['GET', 'POST'])
def student_assignment():
    
    # Check user authentication
    if current_user.is_authenticated:
        form = AssignStudentForm()
        
        # If form is valid add assignment to database
        if form.validate_on_submit():
            studentId = User.query.filter_by(username=form.student.data).first().id
            checkQuizName = Quiz.query.filter_by(name=form.quizName.data).first()
            quizId = checkQuizName.id
            studentQuiz = StudentQuiz(quizId=quizId, studentId=studentId)
            db.session.add(studentQuiz)
            db.session.commit()
            flash('Student has been assigned')
        return render_template('assign-student.html', title='Assign Student to a Quiz', form=form)

    else:
        return redirect(url_for('index'))


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

# Complete quiz page
@app.route('/quiz/complete/<int:id>')
def complete_quiz(id):
    
    # Check user authentication
    if current_user.is_authenticated:
        token = current_user.get_token()
        checkStudentQuiz = StudentQuiz.query.filter_by(
            quizId=id, studentId=current_user.id)
        score = Score.query.filter_by(studentQuizId=StudentQuiz.query.filter_by(quizId=id,studentId=current_user.id).first().id).first()

        # Ensure the user has been assigned to this quiz
        if checkStudentQuiz is None:
            flash("You do not have authorisation to do this quiz.")
            return redirect(url_for("home"))

        # Ensure the user hasn't already completed the quiz
        elif score is not None:
            flash("You have already complete this quiz.")
            return redirect(url_for("home"))

        else:
            return render_template('complete-quiz.html', title='Complete a quiz', id=id, token=token, Quiz=Quiz)
    
    else:
        return redirect(url_for('index'))

# Quiz reviewing page
@app.route('/quiz/review/<int:id>')
def review_quiz(id):
    
    # Check user authentication z
    if current_user.is_authenticated:
        token = current_user.get_token()
        
        # Ensure quiz has been completed
        score = Score.query.filter_by(studentQuizId=id).first()
        student = User.query.filter_by(id=StudentQuiz.query.filter_by(id=id).first().studentId).first()
        if score is None:
            flash("This quiz has not been completed.")
            return redirect(url_for("home"))

        return render_template('review-quiz.html', title='Complete a quiz', id=id, token=token, Quiz=Quiz, score=score, student=student)

    else:
        return redirect(url_for('index'))
