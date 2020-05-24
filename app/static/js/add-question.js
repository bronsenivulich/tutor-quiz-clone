$(document).ready(() => {

    // Keep track of the number of questions added to the quiz
    let qNum = 1

    let token = $("#newQuiz").data("token")

    // Append short answer forms to page when button is clicked
    $('#question-button').click(function () {

        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion shortAnswer">
        <h5 class="question-title">Question: ${qNum}</h5>
        <p class="pb-1">
            <label class="form-headers" style="font-weight: 500;">Question:</label><br>
            <textarea class="form-fields question"></textarea><br>
            <label class="form-headers" style="font-weight: 500;">Answer:</label><br>
            <input type='text' class="form-fields answer"></input>
        </p>
        </div><br><hr>`);

        qNum = qNum + 1;
    });

    // Append multiple choice forms to page when button is clicked
    $('#multiQuestion-button').click(function () {
        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion multiSolution">
        <h5 class="question-title">Question: ${qNum}</h5>
        <p class="pb-1">
            <label class="form-headers" style="font-weight: 500;">Question:</label><br>
            <textarea class="form-fields question"></textarea><br><br>
            <label class="form-headers" style="font-weight: 500;">Possible Answers:</label>
            <div class="possibleAnswers">
                <div id="optionA">
                    <input type='text' class="form-fields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
                <div id="optionB">
                    <input type='text' class="form-fields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
                <div id="optionC">
                    <input type='text' class="form-fields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
                <div id="optionD">
                    <input type='text' class="form-fields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
            </div>
            </p>
        </div><br><hr>
        `);

        qNum = qNum + 1;
    })

    // When the submit button is clicked perform the submit function
    $("#submit-quiz").click(function () {
        $("#newQuiz").submit();
    });

    // The submit function
    $("#newQuiz").submit(function () {

        // Keep track of whether there is an error in the form
        error = false

        // Check the number of questions
        if (qNum <= 1) {
            if (!$("#qNum-error").length) {
                $('#newQuiz').append(`
                    <span id="qNum-error" style="color: red;">Cannot submit a quiz with no questions.</span>
                `);
            }

            // Error rasied
            error = true
        }


        else {
            // Check all form fields are filled
            let formFields = $("#newQuiz").find(".form-fields").toArray()
            console.log(formFields)

            // Itterate through each form field
            formFields.forEach(function (entry) {
                
                // If the form field is empty, raise an error
                if ($(entry).val().length === 0) {
                    if (!$('#emptyField').length) {
                        $('#newQuiz').append(`
                            <span id="emptyField" style="color: red;">Cannot submit a quiz with empty fields.</span>
                        `);
                    }

                    // Error raised
                    error = true
                }
            });
        }

        // If an error is raised, do not complete and submit the form to the database
        if (error == true) {
            return false
        }

        // Form completed successfully
        else {
            let questions = $("#newQuiz").children(".wholeQuestion").toArray()

            let allQuestions = []

            // Itterate through each full question
            questions.forEach(function (entry) {

                // If the question is short answer add to API in this way
                if ($(entry).hasClass("shortAnswer")) {
                    question = {
                        "questionType": "shortAnswer",
                        "question": $(entry).find(".question").val(),
                        "answer": $(entry).find(".answer").val()
                    }
                    allQuestions.push(question)
                }

                // If the question is a multiple-choice question add to API in this way
                else if ($(entry).hasClass("multiSolution")) {
                    let possibleAnswers = $(entry).find(".possibleAnswers").children("div").toArray()
                    let answersToSend = []
                    possibleAnswers.forEach(function (possibleAnswer) {
                        answerToSend = {
                            "answer": $(possibleAnswer).find("input").val(),
                            "isTrue": ("True" == $(possibleAnswer).find("select").val())
                        }
                        answersToSend.push(answerToSend)
                    })
                    question = {
                        "questionType": "multiSolution",
                        "question": $(entry).find(".question").val(),
                        "options": answersToSend
                    }
                    allQuestions.push(question)
                }
            });

            // Store the data in an API
            data = {
                "body": $("#quiz-body").val(),
                "name": $("#quiz-name").val(),
                "questions": allQuestions,
                "studentName": $("#assign-students").val()
            };

            // Asynchronously add to the API and database
            $.ajax({
                url: "/api/quizzes/create",
                type: "post",
                data: JSON.stringify(data),
                contentType: "application/json",
                headers: { "Authorization": 'Bearer ' + token },
                success: function (data) {
                    console.log(data);
                }

            })
        }
    });
});