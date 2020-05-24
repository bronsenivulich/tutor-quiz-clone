$(document).ready(() => { 

    let token = $("#token").data("token")

    $('#request button').click(function () {
        data = {
            requestId: $(this).parent().attr("id"),
        };

        // Update requets database to show the student accepted the request
        if( $(this).attr("class") == "accept") {
            data.accept = true
        }

        // Update request database to show the student declined the request
        else if ($(this).attr("class") == "decline") {
            data.accept = false
        }

        // Asynchronously make the updates
        $.ajax({
            url: "/api/users/request",
            type: "post",
            data: JSON.stringify(data),
            contentType: "application/json",
            headers: { "Authorization": 'Bearer ' + token },
            success: function (data) {
                console.log(data);
            }
        });
    });
})