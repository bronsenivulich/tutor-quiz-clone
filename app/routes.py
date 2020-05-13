from flask import render_template, flash, redirect, url_for, request
from werkzeug.urls import url_parse
from app import app, db
from app.forms import LoginForm, RegistrationForm, ResetPasswordRequestForm, ResetPasswordForm, RequestStudentForm
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, UserType, Request
from app.email import send_password_reset_email

# Landing Page
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title="Welcome")

# Home Page for User Logged-In
@app.route('/home')
@login_required
def home():
    # Convert UserType.id to userType
    userType = UserType.query.filter_by(id=current_user.userType).first().userType
    return render_template("home_student.html", title="Home Page", userType=userType)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(userName=form.userName.data).first()
        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password")
            return redirect(url_for("login"))
        login_user(user, remember=form.rememberMe.data)
        next_page = request.args.get("next")
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for("home")
        return redirect(next_page)
    return render_template('login.html', title="Login", form=form)

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("index"))
    

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(firstName=form.firstName.data, lastName=form.lastName.data, userName=form.userName.data, email=form.email.data)
        user.set_userType(form.userType.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/reset_password_request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = ResetPasswordRequestForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            send_password_reset_email(user)
        flash('Check your email for the instructions to reset your password')
        return redirect(url_for('login'))
    return render_template('reset_password_request.html',
                           title='Reset Password', form=form)

@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    user = User.verify_reset_password_token(token)
    if not user:
        return redirect(url_for('index'))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        user.set_password(form.password.data)
        db.session.commit()
        flash('Your password has been reset.')
        return redirect(url_for('login'))
    return render_template('reset_password.html', form=form)

@app.route('/request_student', methods=['GET', 'POST'])
def request_student():
    form = RequestStudentForm()
    if form.validate_on_submit():
        studentUserName = User.query.filter_by(userName=form.student.data).first()
        studentId = studentUserName.id
        request = Request(tutorId=current_user.id, studentId=studentId, request='pending')
        db.session.add(request)
        db.session.commit()
        flash('Your request has been sent')
    return render_template('request.html', title='Request', form=form)
