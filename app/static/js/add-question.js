$(document).ready(() => {



    console.log("quiz-test");


    $('#question-button').click(function () {



        let qNum = $('#newQuiz').children().length

        $(this).parent().append(`
        <div id="question_${qNum}" class="wholeQuestion">
        <input type='text' class="question"></input>
        <input type='text' class="answer"></input>
        </div>`);
    });
});


function submitQuestions() {
    $('#newQuiz').children(".wholeQuestion").each(function () {
        console.log($(this).children(".question").val())
        console.log($(this).children(".answer").val())
        console.log($(this).attr('id').replace("question_", ""))
    });
}
