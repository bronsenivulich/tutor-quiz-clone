$(document).ready(() => {

    let qNum = 1

    let token = $("#newQuiz").data("token")

    $('#question-button').click(function () {

        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion shortAnswer">
        <h4>Question: ${qNum}</h4>
        <p class="pb-1">
            <label class="form-headers">Question</label><br>
            <textarea class="form-fields question"></textarea><br>
            <label class="form-headers">Answer</label><br>
            <input type='text' class="form-fields answer"></input>
        </p>
        </div>`);

        qNum = qNum + 1;
    });

    $('#multiQuestion-button').click(function () {
        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion multiSolution">
        <h4>Question: ${qNum}</h4>
        <p class="pb-1">
            <label class="form-headers">Question</label><br>
            <textarea class="form-fields question"></textarea><br>
            <label class="form-headers">Possible Answers</label><br>
            <div class="possibleAnswers">
                <div id="optionA">
                    <input type='text' class="form-fields possibleAnswer"></input><select class="correct"><option>False</option><option>True</option></select>
                </div>
                <div id="optionB">
                    <input type='text' class="form-fields possibleAnswer"></input><select class="correct"><option>False</option><option>True</option></select>
                </div>
                <div id="optionC">
                    <input type='text' class="form-fields possibleAnswer"></input><select class="correct"><option>False</option><option>True</option></select>
                </div>
                <div id="optionD">
                    <input type='text' class="form-fields possibleAnswer"></input><select class="correct"><option>False</option><option>True</option></select>
                </div>
            </div>
            </p>
        </div>
        `);

        qNum = qNum + 1;
    })

    $("#submit-quiz").click(function () {
        $("#newQuiz").submit();
    });

    $("#newQuiz").submit(function () {
        if (qNum > 1) {
            let questions = $("#newQuiz").children(".wholeQuestion").toArray()

            let allQuestions = []

            questions.forEach(function (entry) {
                if ($(entry).hasClass("shortAnswer")){
                    question = {
                        "questionType": "shortAnswer",
                        "question": $(entry).find(".question").val(),
                        "answer": $(entry).find(".answer").val()
                    }
                    allQuestions.push(question)
                }
                else if( $(entry).hasClass("multiSolution")){
                    let possibleAnswers = $(entry).find(".possibleAnswers").children("div").toArray()
                    let answersToSend = []
                    possibleAnswers.forEach(function (possibleAnswer) {
                        answerToSend = {
                            "answer": $(possibleAnswer).find("input").val(),
                            "isTrue": $(possibleAnswer).find("select").val()
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
            });
        }
        else {
            if (!$("#qNum-error").length) {
                $('#newQuiz').append(`
                    <span id="qNum-error" style="color: red;">Cannot submit a quiz with no questions.</span>
                `);
            }
            return false
        }
    })


});