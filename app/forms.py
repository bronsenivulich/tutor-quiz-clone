from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, RadioField, TextAreaField, FieldList
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
from app.models import User, UserType, Request, Quiz, UserRelationship
from flask_login import current_user

# Form for log in page
class LoginForm(FlaskForm):
    
    # Feild definition for form
    username = StringField("Username", validators= [DataRequired()])
    password = PasswordField("Password", validators = [DataRequired()])
    rememberMe = BooleanField("Remember Me")
    submit = SubmitField("Sign In")

# Form for user registration
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

    # Check if username already exists
    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    # Check user hasn't already signed up with this email
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')

    # Check if userType exists in UserType table
    def validate_userType(self, userType):
        checkedUserType = UserType.query.filter_by(userType=userType.data).first()
        if checkedUserType is None:
            raise ValidationError("Please enter a valid User Type.")

# Form for requesting password
class ResetPasswordRequestForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Request Password Reset')

    # Ensure a user has such email
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Invalid email address.')
        
# Form to reset password
class ResetPasswordForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Request Password Reset')

# Form to request a new student
class RequestStudentForm(FlaskForm):
    student = StringField('Student Username', validators=[DataRequired()])
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
        existingRequest = Request.query.filter_by(tutorId=tutorId,studentId=studentId).first()
        if existingRequest is not None:
            if existingRequest.request == 'pending' or 'accepted':
                raise ValidationError('You have already sent a request to this student.')

# Form to assign a student to a quiz
class AssignStudentForm(FlaskForm):
    student = StringField('Student Username', validators=[DataRequired()])
    quizName = StringField('Quiz Name', validators=[DataRequired()])
    submit = SubmitField('Assign Student')

    def validate_student(self, student):
        
        # Check user exists
        checkUserName = User.query.filter_by(username=student.data).first()
        if checkUserName is None:
            raise ValidationError('Username does not exist')
        
        # Check user is a student
        checkUserType = checkUserName.userType
        if checkUserType != 2:
            raise ValidationError('User is not a student')
        
        # Check the student has accepted a request from the tutor
        checkUserRelation = UserRelationship.query.filter_by(tutorId=current_user.id, studentId=checkUserName.id)
        if checkUserRelation is None:
            raise ValidationError('This is not your student')
   
    def validate_quizName(self, quizName): 

        # Check quiz exists   
        checkQuizName = Quiz.query.filter_by(name=quizName.data).first()
        if checkQuizName is None:
            raise ValidationError('Quiz does not exist')

        # Ensure the tutor created such quiz
        checkQuizCreator = Quiz.query.filter_by(name=quizName.data).first().tutorId
        if checkQuizCreator != current_user.Id:
            raise ValidationError('Quiz does not exist')

