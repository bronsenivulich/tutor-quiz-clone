$(document).ready(() => {

    let studentQuizId = $("#data").data("student-quiz-id")
    let token = $("#data").data("token")

    function showQuiz(quizData) {

        let questions = quizData.questions
        let qNum = 1

        // Itterate through each question
        questions.forEach(function (entry) {
            
            // If the question is a short answer, append to the page like this
            if (entry.questionType == "shortAnswer") {
                let correct = (entry.answer == entry.submittedAnswer)

                if (correct) {

                    $('#completedQuiz').append(`
                    <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                    <h5 class="questionTitle">Question: ${qNum}</h5><br>
                    <p class="pb-1">
                        <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                        <p>Your Answer: <span class="reviewCorrectAnswer">${entry.submittedAnswer}</span><span style='font-size:18px; padding-left: 0.5%'>&#9989;</span></p>
                        <p>Correct Answer: <span class="reviewPageAnswer">${entry.answer}</span></p>
                    </p>
                    </div><br><hr>`);

                } else {

                    $('#completedQuiz').append(`
                    <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                    <h5 class="questionTitle">Question: ${qNum}</h5><br>
                    <p class="pb-1">
                        <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                        <p>Your Answer: <span class="reviewFalseAnswer">${entry.submittedAnswer}</span><span style='font-size:18px; padding-left: 0.5%'>&#10060;</span></p>
                        <p>Correct Answer: <span class="reviewPageAnswer">${entry.answer}</span></p>
                    </p>
                    </div><br><hr>`);

                }
            }

            // If the question is a multiple-choice, append to the page like this
            else if (entry.questionType == "multiSolution") {

                let answers = "<br>"

                entry.answers.forEach(function (answer) {
                    answers += `<span>${answer}</span><br>`
                });

                $('#completedQuiz').append(`
                <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                <h5 class="questionTitle">Question: ${qNum}</h5><br>
                <p class="pb-1">
                    <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                    <p>Your Answer: <span class="reviewSubmittedAnswer">${entry.submittedAnswer}</span></p>
                    <span>Correct Answers: <span class="reviewPageAnswer">${answers}</span></span>
                </p>
                </div><br><hr>`);
            }
            qNum = qNum + 1;
        });
    }

    // Asynchronously retrieve the API information for this quiz

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