$(document).ready(() => { 


    let token = $("#token").data("token")

    $('.requestButton').click(function () {

        requestToRemove = $(this).parent()

        data = {
            requestId: $(this).parent().attr("id"),
        };

        // Update requets database to show the student accepted the request
        if( $(this).hasClass("accept") ) {
            data.accept = true
        }

        // Update request database to show the student declined the request
        else if( $(this).hasClass("decline") ) {
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
                requestToRemove.remove()
            },
            error: function(error) {
            }
        });
    });
})