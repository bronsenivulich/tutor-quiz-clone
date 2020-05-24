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
                $('#completedQuiz').append(`
                <div id="quizQuestion_${qNum}" class="wholeQuestion shortAnswer">
                <h5 class="question-title">Question: ${qNum}</h5><br>
                <p class="pb-1">
                    <span class="question" id="questionId_${entry.questionId}">${entry.question}</span><br><br>
                    <p>Your Answer: ${entry.submittedAnswer}</p>
                    <p>Correct Answer: ${entry.answer}</p>
                </p>
                </div><br><hr>`);
            }

            // If the question is a multiple-choice, append to the page like this
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
                    <p>Your Answer: ${entry.submittedAnswer}</p>
                    <span>Correct Answers: ${answers}</span>
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