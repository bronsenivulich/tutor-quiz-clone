$(document).ready(() => {

    let qNum = 1

    let token = $("#newQuiz").data("token")

    $('#question-button').click(function () {

        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion">
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

    $("#submit-quiz").click(function () {
        $("#newQuiz").submit();
    });

    $("#newQuiz").submit(function () {
        if (qNum > 1) {
            let questions = $("#newQuiz").children(".wholeQuestion").toArray()

            let allQuestions = []

            questions.forEach(function (entry) {
                question = {
                    "question": $(entry).find(".question").val(),
                    "answer": $(entry).find(".answer").val()
                }
                allQuestions.push(question)
            });

            data = {
                "body": $("#quiz-body").val(),
                "name": $("#quiz-name").val(),
                "questions": allQuestions,
                "studentName": $("#assign-students").val()
            };

            $.ajax({
                url: "/api/quizzes",
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