$(document).ready(() => {



    console.log("quiz-test");


    $('#question-button').click(function () {



        let qNum = $('#newQuiz').children().length - 2

        $(this).parent().append(`
        <div id="question_${qNum}" class="wholeQuestion">
        <input type='text' class="question"></input>
        <input type='text' class="answer"></input>
        </div>`);
    });

    $("#submit_button").click(function () {
        let questions = $("#newQuiz").children(".wholeQuestion").toArray()


        let allQuestions = []


        questions.forEach(function(entry) {
            question = {
                "question": $(entry).children(".question").val(),
                "answer": $(entry).children(".answer").val()
            }
            allQuestions.push(question)
        });

        console.log(allQuestions)
        
        myObj = {
            "body": $("#quiz-body").val(),
            "name": $("#quiz-name").val(),
            "questions": allQuestions,
            "tutorId": 69
          };
        $.ajax({
            url: "/api/quizzes",
            type: "post",
            data: JSON.stringify(myObj),
            contentType: "application/json",
            success: function (data) {
                console.log(data);
            }
        });
    })
});