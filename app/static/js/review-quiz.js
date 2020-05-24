$(document).ready(() => {

    let studentQuizId = $("#data").data("student-quiz-id")
    let token = $("#data").data("token")

    function showQuiz(quizData) {

        let questions = quizData.questions
        let qNum = 1

        questions.forEach(function (entry) {
            if (entry.questionType == "shortAnswer") {
                let correct = (entry.answer == entry.submittedAnswer)

                if (correct) {

                    $('#completedQuiz').append(`
                    <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                    <h5 class="question-title">Question: ${qNum}</h5><br>
                    <p class="pb-1">
                        <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                        <p>Your Answer: <span class="reviewCorrectAnswer">${entry.submittedAnswer}</span><span style='font-size:18px; padding-left: 0.5%'>&#9989;</span></p>
                        <p>Correct Answer: <span class="reviewPageAnswer">${entry.answer}</span></p>
                    </p>
                    </div><br><hr>`);

                } else {

                    $('#completedQuiz').append(`
                    <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                    <h5 class="question-title">Question: ${qNum}</h5><br>
                    <p class="pb-1">
                        <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                        <p>Your Answer: <span class="reviewFalseAnswer">${entry.submittedAnswer}</span><span style='font-size:18px; padding-left: 0.5%'>&#10060;</span></p>
                        <p>Correct Answer: <span class="reviewPageAnswer">${entry.answer}</span></p>
                    </p>
                    </div><br><hr>`);

                }
            }
            else if (entry.questionType == "multiSolution") {

                let answers = "<br>"

                entry.answers.forEach(function (answer) {
                    answers += `<span>${answer}</span><br>`
                });

                $('#completedQuiz').append(`
                <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                <h5 class="question-title">Question: ${qNum}</h5><br>
                <p class="pb-1">
                    <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                    <p>Your Answer: <span class="reviewSubmittedAnswer">${entry.submittedAnswer}</span></p>
                    <span>Correct Answers: <span class="reviewPageAnswer">${answers}</span></span>
                </p>
                </div><br><hr>`);


                // $('#completedQuiz').append(`
                // <div id="question_${qNum}" class="wholeQuestion multiSolution">
                // <h5 class="question-title">Question: ${qNum}</h5><br>
                // <p>
                // <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                // <div class="row d-flex justify-content-center px-5 mx-5"></div>
                // </p>
                // </div><hr>
                // `);
                // let optionNum = 1;
                // entry.options.forEach(function (option) {
                //     $(`#question_${qNum}`).find(".row").append(`<div class="px-3"><label class="mr-2" for="choice_${option.choiceId}">${option.answer}</label><input class="multi-button" type="radio" id="choice_${option.choiceId}" name="question_${entry.questionId}" value="${option.choiceId}"></div>
                //     `);
                //     optionNum = optionNum + 1;
                // })
            }
            qNum = qNum + 1;
        });
    }


    $.ajax({
        url: `/api/quizzes/completed/${studentQuizId}`,
        type: "get",
        contentType: "application/json",
        headers: { "Authorization": 'Bearer ' + token },
        success: function (data) {
            showQuiz(data)
        },
        error: function (resp) {
        }
    });
});