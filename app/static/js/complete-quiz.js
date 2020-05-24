$(document).ready(() => {

    let quizId = $("#data").data("quiz-id")
    let token = $("#data").data("token")

    function showQuiz(quizData) {
        let questions = quizData.questions
        let qNum = 1

        questions.forEach(function (entry) {
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

    $("#submitQuiz").click(function () {
        console.log("click")
        $("#completeQuiz").submit();
    });

    
    let errorChecked = false

    $("#completeQuiz").submit(function () {

        error = false

        let formFields = $("#completeQuiz").find(".form-fields").toArray()
        console.log(formFields)

        formFields.forEach(function (entry) {
            if ($(entry).val().length === 0) {
                if (!$("#emptyField-error").length) {
                    $('#completeQuiz').append(`
                        <span id="emptyField-error" style="color: red;">You have an empty field, would you like to submit anyway?</span>
                    `);
                }
            error = true
            }
        });

        if (error == false || errorChecked) {

            let answers = $("#completeQuiz").children(".wholeQuestion").toArray()

            let allAnswers = []

            answers.forEach(function (entry) {
                if ($(entry).hasClass("shortAnswer")) {
                    answer = {
                        "questionType": "shortAnswer",
                        "questionId": $(entry).find("span").attr("id").replace("questionId_", ""),
                        "studentAnswer": $(entry).find(".answer").val()
                    }
                    allAnswers.push(answer)
                }
                else if ($(entry).hasClass("multiSolution")) {
                    answer = {
                        "questionType": "multiSolution",
                        "questionId": $(entry).find("span").attr("id").replace("questionId_", ""),
                        "studentAnswer": $(entry).find("input:checked").val()
                    }
                    allAnswers.push(answer)
                }
            });

            data = {
                "answers": allAnswers
            }

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

        else {
            errorChecked = true
            return false
        }

    });

});