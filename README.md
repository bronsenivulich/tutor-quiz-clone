# Tutor Quiz - CITS3403 Project


## OnTrack

This is a web application developed by students of Agile Web Development for a project submission. The idea was for students to be able to access a wider range of resources when studying for a test, as well as for tutors to be able to create their own quizzes to assign to their current students. 

Through this application, tutors can request students, who will have the ability to accept or deny such requests, create quizzes, with multiple choice questions or short answer questions, assign such quizzes to students and review students quiz answers. Students are able to complete quizzes, see tutor requests and review their quizzes.


## Development of OnTrack
### Forms
To develop this application we started with the use of WTForms, when this failed we resorted to using an API. This API is not a full REST API but it can handle the creation of quizzes, completion of quizzes and the editting of quizzes. The getting and posting of these APIs utilised the Asynchronous JavaScript and XML to ensure a nicely flowing website.

### Bootstrap
To most efficiently design the website we utilised the use of bootstrap. This allowed us, paired with our CSS, to have a consistent styling across all pages of the application. Through the use of bootstrap, we have also allowed out webpages to be fully responsive.

### JQuery
To make the development of out backend easier and more efficeint we employed the use of JQuery. Using JQuery we could more succinctly create the JavaScript functions.



## Installing
After clone repo, use following command to create your own virtualenv. 
On mac or Linux:
```
$ virtualenv env
```
Or on windows:
```
$ python -m venv env
```
Then change into your vritualenv.
On mac or Linux:
```
$ source env/bin/activate
```
Or on windows:
```
$ source env/Scripts/activate
```
Then you must install dependencies from requirements.txt.
```
$ pip install -r requirements.txt
```

## Running the tests
To run the tests you will need to open the root directory for the project in a terminal window and enter the command:
```
python test.py
```
**Ensure that the virtual environmnet is not active when you run the automated tests, it will give you an error**

This is a list of tests that can be conducted:
- Test proper useage of tutor ID in Quiz model when creating quizzes
- When a student is assigned to a quiz the correct ID is assigned to the database
- Ensure the correct answer is marked for short answer and multiple choice
- Check that when a student completes a quiz, a score is added to the database and that it is shown as a completed quiz
- Check if a student has completed a quiz, that they have a score for that quiz
- When a second student is added to a quiz that you can still complete it


## Deployment
To run this server locally, assuming correct installation, set the virtual environment variables by opening the terminal at the root directory of the project and enter:
```
$ export FLASK_APP=tutor-quiz.py
$ export FLASK_ENV=development
```
The command for setting environmental variables may be different if you are not using Git bash / if you are using Windows

Also, these can be saved (they reset each type) by creating a .env file in the root of tutor-quiz and adding the following:
```
FLASK_APP=tutor-quiz.py
FLASK_ENV=development
```
Then, run the flask web-server with the following.
```
$ flask run
```
## Dummy Accounts
**For the marker's attention**
There are some dummy accounts available for use with the credentials:

Username: test_tutor

Password: test

Username: test_tutor2

Password: test

Username: test_student1

Password: test

Username: test_student2

Password: test

Username: test_student3

Password: test

Username: test_student4

Password: test

Username: test_student5

Password: test

## Dependencies
* alembic==1.4.2
* astroid==2.4.0
* blinker==1.4
* click==7.1.1
* dnspython==1.16.0
* email-validator==1.0.5
* Flask==1.1.2
* Flask-HTTPAuth==4.0.0
* Flask-Login==0.5.0
* Flask-Mail==0.9.1
* Flask-Migrate==2.5.3
* Flask-SQLAlchemy==2.4.1
* Flask-WTF==0.14.3
* idna==2.9
* isort==4.3.21
* itsdangerous==1.1.0
* Jinja2==2.11.2
* lazy-object-proxy==1.4.3
* Mako==1.1.2
* MarkupSafe==1.1.1
* mccabe==0.6.1
* PyJWT==1.7.1
* pylint==2.5.0
* python-dateutil==2.8.1
* python-dotenv==0.13.0
* python-editor==1.0.4
* six==1.14.0
* SQLAlchemy==1.3.16
* toml==0.10.0
* Werkzeug==1.0.1
* wrapt==1.12.1
* WTForms==2.3.1

## Authors
* Lauren Campbell - 22498451
* Julius Hinchliffe - 22487283
* Bronsen Ivulich - 22494115
* Benjamin Podmore - 22504617