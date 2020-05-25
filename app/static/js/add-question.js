$(document).ready(() => {

    // Keep track of the number of questions added to the quiz
    let qNum = 1

    let token = $("#newQuiz").data("token")

    // Append short answer forms to page when button is clicked
    $('#questionButton').click(function () {

        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion shortAnswer">
        <h5 class="questionTitle">Question: ${qNum}</h5>
        <p class="pb-1">
            <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
            <textarea class="formFields question"></textarea><br>
            <label class="formHeaders" style="font-weight: 500;">Answer:</label><br>
            <input type='text' class="formFields answer"></input>
        </p>
        <button class='submitButton removeQuestion' type='button'>Remove Question</button>
        <br><hr></div>`);

        qNum = qNum + 1;
    });

    // Append multiple choice forms to page when button is clicked
    $('#multiQuestionButton').click(function () {
        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion multiSolution">
        <h5 class="questionTitle">Question: ${qNum}</h5>
        <p class="pb-1">
            <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
            <textarea class="formFields question"></textarea><br><br>
            <label class="formHeaders" style="font-weight: 500;">Possible Answers:</label>
            <div class="possibleAnswers">
                <div id="optionA">
                    <input type='text' class="formFields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
                <div id="optionB">
                    <input type='text' class="formFields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
                <div id="optionC">
                    <input type='text' class="formFields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
                <div id="optionD">
                    <input type='text' class="formFields possibleAnswer mb-2"></input><select class="correct ml-3"><option>False</option><option>True</option></select>
                </div>
            </div>
            </p>
            <button class='submitButton removeQuestion' type='button'>Remove Question</button>
        <br><hr></div>
        `);

        qNum = qNum + 1;
    });

    $(document).on("click", ".removeQuestion" , function() {
        $(this).parent().remove();
        qNum = qNum - 1;
    });


    $("#submitQuiz").click(function () {

        // Keep track of whether there is an error in the form
        error = false

        // Check the number of questions
        if (qNum <= 1) {
            if (!$("#qNumError").length) {
                $('#newQuiz').append(`
                    <span id="qNumError" style="color: red;">Cannot submit a quiz with no questions.</span>
                `);
            }

            // Error rasied
            error = true
        }


        else {
            // Check all form fields are filled
            let formFields = $("#newQuiz").find(".formFields").toArray()
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
                "body": $("#quizBody").val(),
                "name": $("#quizName").val(),
                "questions": allQuestions,
                "studentName": $("#assignStudents").val()
            };

            // Asynchronously add to the API and database
            $.ajax({
                url: "/api/quizzes/create",
                type: "post",
                data: JSON.stringify(data),
                contentType: "application/json",
                headers: { "Authorization": 'Bearer ' + token },
                success: function (data) {
                    window.location.href = "/home"
                },
                error: function(error) {
                    alert(error)
                }

            })
        }
    });
});
