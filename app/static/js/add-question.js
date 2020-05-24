$(document).ready(() => {

    let qNum = 1

    let token = $("#newQuiz").data("token")

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
        <button class='submitButton removeQuestion' type='button'>Remove Question</button>
        <br><hr></div>`);

        qNum = qNum + 1;
    });

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
            <button class='submitButton removeQuestion' type='button'>Remove Question</button>
        <br><hr></div>
        `);

        qNum = qNum + 1;
    });

    $(document).on("click", ".removeQuestion" , function() {
        $(this).parent().remove();
        qNum = qNum - 1;
    });



    $("#submit-quiz").click(function () {
        $("#newQuiz").submit();
    });

    $("#newQuiz").submit(function () {

        error = false
        if (qNum <= 1) {
            if (!$("#qNum-error").length) {
                $('#newQuiz').append(`
                    <span id="qNum-error" style="color: red;">Cannot submit a quiz with no questions.</span>
                `);
            }
            error = true
        }

        else {
            let formFields = $("#newQuiz").find(".form-fields").toArray()

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
                "body": $("#quiz-body").val(),
                "name": $("#quiz-name").val(),
                "questions": allQuestions,
                "studentName": $("#assign-students").val()
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
