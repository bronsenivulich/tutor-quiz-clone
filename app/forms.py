from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, RadioField, TextAreaField, FieldList
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
from app.models import User, UserType, Request, Quiz, UserRelationship
from flask_login import current_user


class LoginForm(FlaskForm):

    username = StringField("Username", validators= [DataRequired()])
    password = PasswordField("Password", validators = [DataRequired()])
    rememberMe = BooleanField("Remember Me")
    submit = SubmitField("Sign In")

class RegistrationForm(FlaskForm):
    firstName = StringField('First Name', validators=[DataRequired()])
    lastName = StringField('Last Name', validators=[DataRequired()])
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    passwordAgain = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    # Each choice is (userType, label)
    userType = RadioField('User Type', choices=[("student","Student"),("tutor","Tutor")], validators=[DataRequired()])
    submit = SubmitField('Register')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')

    # Check if userType exists in UserType table
    def validate_userType(self, userType):
        checkedUserType = UserType.query.filter_by(userType=userType.data).first()
        if checkedUserType is None:
            raise ValidationError("Please enter a valid User Type.")

class ResetPasswordRequestForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Request Password Reset')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Invalid email address.')
        

class ResetPasswordForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Request Password Reset')

class RequestStudentForm(FlaskForm):
    student = StringField('Student User Name', validators=[DataRequired()])
    submit = SubmitField('Request Student')

    def validate_student(self, student):
        
        # check current user is a tutor
        checkCurrentUserType = User.query.filter_by(id=current_user.id).first().userType
        print(checkCurrentUserType)
        if checkCurrentUserType != 1:
            raise ValidationError('Current user is not a tutor')

        # check requested user is a student
        checkUserName = User.query.filter_by(username=student.data).first()
        if checkUserName is None:
            raise ValidationError('Username does not exist')
        checkUserType = checkUserName.userType
        if checkUserType != 2:
            raise ValidationError('User is not a student')
        
        # check request has not already been sent
        studentId = User.query.filter_by(username=student.data).first().id
        tutorId = current_user.id
        existingRequest = Request.query.filter_by(tutorId=tutorId, studentId=studentId).first().request
        if existingRequest is not None:
            if existingRequest == 'pending' or 'accepted':
                raise ValidationError('You have already sent a request to this student.')

class CreateQuizForm(FlaskForm):
    
    quizTitle = StringField('Quiz Title', validators=[DataRequired()])
    quizBody = TextAreaField('Quiz Description', validators=[DataRequired()])
    submit = SubmitField('Create Quiz')
    question = StringField()
    
class AssignStudentForm(FlaskForm):
    student = StringField('Student User Name', validators=[DataRequired()])
    quizName = StringField('Quiz Name', validators=[DataRequired()])
    submit = SubmitField('Assign Student')

    def validate_student(self, student):
        checkUserName = User.query.filter_by(username=student.data).first()
        if checkUserName is None:
            raise ValidationError('Username does not exist')
        checkUserType = checkUserName.userType
        if checkUserType != 2:
            raise ValidationError('User is not a student')
        checkUserRelation = UserRelationship.query.filter_by(tutorId=current_user.id, studentId=checkUserName.id)
        if checkUserRelation is None:
            raise ValidationError('This is not your student')
        
    def validate_quizName(self, quizName):    
        checkQuizName = Quiz.query.filter_by(name=quizName.data).first()
        if checkQuizName is None:
            raise ValidationError('Quiz does not exist')
        checkQuizCreator = Quiz.query.filter_by(name=quizName.data).first().tutorId
        if checkQuizCreator != current_user.Id:
            raise ValidationError('Quiz does not exist')

