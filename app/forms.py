from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, RadioField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
from app.models import User, UserType

class LoginForm(FlaskForm):

    userName = StringField("Username", validators = [DataRequired()])
    password = PasswordField("Password", validators = [DataRequired()])
    rememberMe = BooleanField("Remember Me")
    submit = SubmitField("Sign In")


class RegistrationForm(FlaskForm):
    firstName = StringField('First Name', validators=[DataRequired()])
    lastName = StringField('Last Name', validators=[DataRequired()])
    userName = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    passwordAgain = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    # Each choice is (userType, label)
    userType = RadioField('User Type', choices=[("student","Student"),("tutor","Tutor")], validators=[DataRequired()])
    submit = SubmitField('Register')

    def validate_username(self, userName):
        user = User.query.filter_by(userName=userName.data).first()
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

class ResetPasswordForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Request Password Reset')