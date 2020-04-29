# Tutor Quiz - CITS3403 Project
## Members
* Lauren Campbell
* Julius Hinchliffe
* Bronsen Ivulich
* Benjamin Podmore

## Usage
After clone repo, use following command to create your own virtualenv.
```
$ virtualenv env
```
(Or on windows)
```
$ python -m venv env
```
Then change into your vritualenv.
```
$ source env/bin/activate
```
(Or on windows)
```
$ source env/Scripts/activate
```
Install dependencies from requirements.txt.
```
$ pip install -r requirements.txt
```
Set flask environmental variables.
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