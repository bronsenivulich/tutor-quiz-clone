$(document).ready(() => { 

    let token = $("#token").data("token")

    $('#request button').click(function () {
        data = {
            requestId: $(this).parent().attr("id"),
        };

        if( $(this).attr("class") == "accept") {
            data.accept = true
        }
        else if ($(this).attr("class") == "decline") {
            data.accept = false
        }

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