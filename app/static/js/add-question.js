$(document).ready(() => {

    let qNum = 1

    $('#question-button').click(function () {

        $('#newQuiz').append(`
        <div id="question_${qNum}" class="wholeQuestion">
        <h4>Question: ${qNum}</h4>
        <p>
            <label class="form-headers">Question</label><br>
            <textarea class="form-fields question"></textarea><br>
            <label class="form-headers">Answer</label><br>
            <input type='text' class="form-fields answer"></input>
        </p>
        </div>`);

        qNum = qNum + 1;
    });

    $("#submit-quiz").click(function () {
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
            "tutorId": 69
        };
        $.ajax({
            url: "/api/quizzes",
            type: "post",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (data) {
                console.log(data);
            }
        });

    })
});