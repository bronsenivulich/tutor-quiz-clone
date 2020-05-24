$(document).ready(() => {

    let quizId = $("#data").data("quiz-id")
    let token = $("#data").data("token")

    function showQuiz(quizData) {
        let questions = quizData.questions
        let qNum = 1

        // Itterate through each question to append to the page
        questions.forEach(function (entry) {

            // Append in this way if it is a short answer
            if (entry.questionType == "shortAnswer") {
                $('#completeQuiz').append(`
                <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                <h5 class="question-title">Question: ${qNum}</h5><br>
                <p class="pb-1">
                    <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                    <label class="form-headers mt-2 mr-2">Answer</label>
                    <input type='text' class="form-fields answer"></input>
                </p>
                </div><br><hr>`);
            }

            // Append this way if a multiple-choice
            else if (entry.questionType == "multiSolution") {
                $('#completeQuiz').append(`
                <div id="question_${qNum}" class="wholeQuestion multiSolution">
                <h5 class="question-title">Question: ${qNum}</h5><br>
                <p>
                <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                <div class="row d-flex justify-content-center px-5 mx-5"></div>
                </p>
                </div><hr>
                `);
                let optionNum = 1;
                entry.options.forEach(function (option) {
                    $(`#question_${qNum}`).find(".row").append(`<div class="px-3"><label class="mr-2" for="choice_${option.choiceId}">${option.answer}</label><input class="multi-button" type="radio" id="choice_${option.choiceId}" name="question_${entry.questionId}" value="${option.choiceId}"></div>
                    `);
                    optionNum = optionNum + 1;
                })
            }
            qNum = qNum + 1;
        });
    }

    // Get the data from the quiz questions
    $.ajax({
        url: `/api/quizzes/${quizId}`,
        type: "get",
        contentType: "application/json",
        headers: { "Authorization": 'Bearer ' + token },
        success: function (data) {
            showQuiz(data)
        },
        error: function (resp) {
        }
    });

    // When the submit button is pressed, run the submit function
    $("#submitQuiz").click(function () {
        $("#completeQuiz").submit();
    });

    let errorChecked = false

    // Submit function
    $("#completeQuiz").submit(function () {

        // Keep track of whether there is an error in the form
        error = false

        let formFields = $("#completeQuiz").find(".form-fields").toArray()
        console.log(formFields)

        // Itterate through each form field
        formFields.forEach(function (entry) {

            // If the field is empty raise this error
            if ($(entry).val().length === 0) {
                if (!$("#emptyField-error").length) {
                    $('#completeQuiz').append(`
                        <span id="emptyField-error" style="color: red;">You have an empty field, would you like to submit anyway?</span>
                    `);
                }
            
            // Error raised
            error = true
            }
        });

        // If there is no errors or the error has already been checked submit responses
        if (error == false || errorChecked) {

            let answers = $("#completeQuiz").children(".wholeQuestion").toArray()

            let allAnswers = []

            // Itterate through each answer
            answers.forEach(function (entry) {

                // If it is an answer to a short answer push data to API in this way
                if ($(entry).hasClass("shortAnswer")) {
                    answer = {
                        "questionType": "shortAnswer",
                        "questionId": $(entry).find("span").attr("id").replace("questionId_", ""),
                        "studentAnswer": $(entry).find(".answer").val()
                    }
                    allAnswers.push(answer)
                }

                // If it is an answer to a multiple-choice push data to API in this way
                else if ($(entry).hasClass("multiSolution")) {
                    answer = {
                        "questionType": "multiSolution",
                        "questionId": $(entry).find("span").attr("id").replace("questionId_", ""),
                        "studentAnswer": $(entry).find("input:checked").val()
                    }
                    allAnswers.push(answer)
                }
            });

            // Store the data
            data = {
                "answers": allAnswers
            }

            // Asynchronously push the data to an API and to the database
            $.ajax({
                url: `/api/quizzes/submit/${quizId}`,
                data: JSON.stringify(data),
                type: "post",
                contentType: "application/json",
                headers: { "Authorization": 'Bearer ' + token },
                success: function (data) {
                    // console.log(data)
                },
                error: function (resp) {
                    // console.log(resp)
                }
            });
        }

        // If the error has not been checked, do not submit the form
        else {
            errorChecked = true
            return false
        }

    });

});