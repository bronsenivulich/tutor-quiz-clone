$(document).ready(() => {

    let qNum = 1

    let token = $("#newQuiz").data("token")

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
        </div><br><hr>`);

        qNum = qNum + 1;
    });

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
        </div><br><hr>
        `);

        qNum = qNum + 1;
    })

    $("#submitQuiz").click(function () {
        $("#newQuiz").submit();
    });

    $("#newQuiz").submit(function () {

        error = false
        if (qNum <= 1) {
            if (!$("#qNumError").length) {
                $('#newQuiz').append(`
                    <span id="qNumError" style="color: red;">Cannot submit a quiz with no questions.</span>
                `);
            }
            error = true
        }

        else {
            let formFields = $("#newQuiz").find(".formFields").toArray()
            console.log(formFields)

            formFields.forEach(function (entry) {
                if ($(entry).val().length === 0) {
                    if (!$('#emptyField').length) {
                        $('#newQuiz').append(`
                            <span id="emptyField" style="color: red;">Cannot submit a quiz with empty fields.</span>
                        `);
                    }
                    error = true
                }
            });
        }

        if (error == true) {
            return false
        }

        else {
            let questions = $("#newQuiz").children(".wholeQuestion").toArray()

            let allQuestions = []

            questions.forEach(function (entry) {
                if ($(entry).hasClass("shortAnswer")) {
                    question = {
                        "questionType": "shortAnswer",
                        "question": $(entry).find(".question").val(),
                        "answer": $(entry).find(".answer").val()
                    }
                    allQuestions.push(question)
                }
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


            data = {
                "body": $("#quizBody").val(),
                "name": $("#quizName").val(),
                "questions": allQuestions,
                "studentName": $("#assignStudents").val()
            };

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