$(document).ready(() => {

    let quizId = $("#data").data("quiz-id")
    let token = $("#data").data("token")

    let qNum = 1

    function showQuiz(quizData) {
        let questions = quizData.questions

        $("#quizName").val(quizData.name);
        $("#quizBody").val(quizData.body);

        // Itterate through each question to append to the page
        questions.forEach(function (entry) {

            // Append in this way if it is a short answer
            if (entry.questionType == "shortAnswer") {
                console.log(entry.currentAnswer)
                $('#editQuiz').append(`
                <div id="question_${qNum}" class="wholeQuestion shortAnswer">
                <h5 class="questionTitle">Question: ${qNum}</h5><br>
                <p class="pb-1">
                    <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
                    <textarea class="formFields question" id="questionId_${entry.questionId}"></textarea><br>
                    <label class="formHeaders mt-2 mr-2">Answer</label>
                    <input type='text' class="formFields answer" id="shortAnswerId_${entry.shortAnswerId}"></input>
                </p>
                <button class='submitButton removeQuestion' type='button'>Remove Question</button>
                <br><hr></div>`);

                $(`.wholeQuestion #questionId_${entry.questionId}`).val(entry.question);
                $(`.wholeQuestion #shortAnswerId_${entry.shortAnswerId}`).val(entry.currentAnswer);
            }

            // Append this way if a multiple-choice
            else if (entry.questionType == "multiSolution") {
                $('#editQuiz').append(`
                <div id="question_${qNum}" class="wholeQuestion multiSolution">
                <h5 class="questionTitle">Question: ${qNum}</h5>
                <p class="pb-1">
                    <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
                    <textarea class="formFields question" id="questionId_${entry.questionId}"></textarea><br>
                    <label class="formHeaders" style="font-weight: 500;">Possible Answers:</label>
                    <div class="possibleAnswers">
                    </div>
                    </p>
                    <button class='submitButton removeQuestion' type='button'>Remove Question</button>
                <br><hr></div>
                `);
                $(`.wholeQuestion #questionId_${entry.questionId}`).val(entry.question);

                let optionNum = 1;
                entry.options.forEach(function (option) {
                    console.log(option)
                    $(`#question_${qNum}`).find(".possibleAnswers").append(`
                        <div id="optionA">
                            <input type='text' class="formFields possibleAnswer mb-2" id="choice_${option.choiceId}"></input>
                            <select class="correct ml-3" id="choice_${option.choiceId}">
                                <option>False</option><option>True</option>
                            </select>
                        </div>
                    `);
                    // $(`#question_${qNum}`).find(".row").append(`<div class="px-3"><label class="mr-2" for="choice_${option.choiceId}">${option.answer}</label>
                    // <input class="multi-button" type="radio" id="choice_${option.choiceId}" name="question_${entry.questionId}" value="${option.choiceId}"></div>

                    $(`.possibleAnswer#choice_${option.choiceId}`).val(option.answer)
                    if (option.isCorrect) {
                        $(`.correct#choice_${option.choiceId}`).val("True")
                    }
                    optionNum = optionNum + 1;
                });
            }
            qNum = qNum + 1;
        });
    }

        // Append short answer forms to page when button is clicked
        $('#questionButton').click(function () {

            $('#editQuiz').append(`
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
            $('#editQuiz').append(`
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

    // Get the data from the quiz questions
    $.ajax({
        url: `/api/quizzes/${quizId}`,
        type: "get",
        contentType: "application/json",
        headers: { "Authorization": 'Bearer ' + token },
        success: function (data) {
            showQuiz(data)
            console.log(data)
        },
        error: function (resp) {
            console.log(resp)
        }
    });

    // When the submit button is pressed, run the submit function
    $("#submitQuiz").click(function () {
        $("#editQuiz").submit();
    });

    let errorChecked = false

    // Submit function
    $("#editQuiz").submit(function () {

        // Keep track of whether there is an error in the form
        error = false

        let formFields = $("#editQuiz").find(".formFields").toArray()
        console.log(formFields)

        // Itterate through each form field
        formFields.forEach(function (entry) {

            // If the field is empty raise this error
            if ($(entry).val().length === 0) {
                if (!$("#emptyField-error").length) {
                    $('#editQuiz').append(`
                        <span id="emptyField-error" style="color: red;">You have an empty field, would you like to submit anyway?</span>
                    `);
                }

                // Error raised
                error = true
            }
        });

        // If there is no errors or the error has already been checked submit responses
        if (error == false || errorChecked) {

            let answers = $("#editQuiz").children(".wholeQuestion").toArray()

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