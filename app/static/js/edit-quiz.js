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
                $('#editQuiz').append(`
                <div id="question_${qNum}" class="wholeQuestion shortAnswer oldQuestion">
                <h5 class="questionTitle">Question: ${qNum}</h5><br>
                <p class="pb-1">
                    <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
                    <textarea class="formFields questionValue" id="questionId_${entry.questionId}"></textarea><br>
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
                <div id="question_${qNum}" class="wholeQuestion multiSolution oldQuestion">
                <h5 class="questionTitle">Question: ${qNum}</h5>
                <p class="pb-1">
                    <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
                    <textarea class="formFields questionValue" id="questionId_${entry.questionId}"></textarea><br>
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
                    $(`#question_${qNum}`).find(".possibleAnswers").append(`
                        <div class="option">
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
            <div id="question_${qNum}" class="wholeQuestion shortAnswer newQuestion">
            <h5 class="questionTitle">Question: ${qNum}</h5>
            <p class="pb-1">
                <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
                <textarea class="formFields questionValue"></textarea><br>
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
            <div id="question_${qNum}" class="wholeQuestion multiSolution newQuestion">
            <h5 class="questionTitle">Question: ${qNum}</h5>
            <p class="pb-1">
                <label class="formHeaders" style="font-weight: 500;">Question:</label><br>
                <textarea class="formFields questionValue"></textarea><br><br>
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

    $(document).on("click", ".removeQuestion", function () {
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
        },
        error: function (resp) {
            console.log(resp)
        }
    });


    let errorChecked = false

    // Submit Quiz
    $("#submitQuiz").click(function () {


        // Keep track of whether there is an error in the form
        error = false

        // Check the number of questions
        if ($("#editQuiz").find(".wholeQuestion").toArray().length == 0) {
            if (!$("#qNumError").length) {
                $('#editQuiz').append(`
                    <span id="qNumError" style="color: red;">Cannot submit a quiz with no questions.</span>
                `);
            }

            // Error rasied
            error = true
        }


        else {
            // Check all form fields are filled
            let formFields = $("#editQuiz").find(".formFields").toArray()

            // Itterate through each form field
            formFields.forEach(function (entry) {

                // If the form field is empty, raise an error
                if ($(entry).val().length === 0) {
                    if (!$('#emptyField').length) {
                        $('#editQuiz').append(`
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
            let questions = $("#editQuiz").children(".wholeQuestion").toArray()

            let allQuestions = []

            // Itterate through each full question
            questions.forEach(function (entry) {

                // Check if question didn't exist before
                if ($(entry).hasClass("newQuestion")) {

                    // If the question is short answer add to API in this way

                    if ($(entry).hasClass("shortAnswer")) {
                        question = {
                            "questionType": "shortAnswer",
                            "question": $(entry).find(".questionValue").val(),
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
                            "question": $(entry).find(".questionValue").val(),
                            "options": answersToSend
                        }
                        allQuestions.push(question)
                    }
                }
                else if ($(entry).hasClass("oldQuestion")) {

                    // If the question is short answer add to API in this way

                    if ($(entry).hasClass("shortAnswer")) {
                        question = {
                            "questionType": "shortAnswer",
                            "question": $(entry).find(".questionValue").val(),
                            "answer": $(entry).find(".answer").val(),
                            "shortAnswerId": $(entry).find("input").attr("id").replace("shortAnswerId_", ""),
                            "questionId": $(entry).find("textarea").attr("id").replace("questionId_", "")
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
                                "isTrue": ("True" == $(possibleAnswer).find("select").val()),
                                "choiceId" : $(possibleAnswer).find("input").attr("id").replace("choice_","")
                            }
                            answersToSend.push(answerToSend)
                        })
                        question = {
                            "questionType": "multiSolution",
                            "question": $(entry).find(".questionValue").val(),
                            "questionId" : $(entry).find("textarea").attr("id").replace("questionId_", ""),
                            "options": answersToSend
                        }
                        allQuestions.push(question)
                    }
                }
            });

            // Store the data in an API
            data = {
                "body": $("#quizBody").val(),
                "name": $("#quizName").val(),
                "questions": allQuestions
            };

            console.log(data)



            // Asynchronously add to the API and database
            $.ajax({
                url: `/api/quizzes/edit/${quizId}`,
                type: "post",
                data: JSON.stringify(data),
                contentType: "application/json",
                headers: { "Authorization": 'Bearer ' + token },
                success: function (data) {
                    window.location.href = "/home"
                },
                error: function (error) {
                    console.log(error)
                }

            })
        }
    });

});