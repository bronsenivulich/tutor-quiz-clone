$(document).ready(() => { 

    let token = $("#token").data("token")

    $('button').click(function () {
        console.log("test");
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

    // $('#newAccept').submit(function () {
    //     console.log("test");
    //     data = {
    //         "tutorId": $("#tutorId").val()
    //     };

    //     $.ajax({
    //         url: "/api/accept_request",
    //         type: "post",
    //         data: JSON.stringify(data),
    //         contentType: "application/json",
    //         headers: { "Authorization": 'Bearer ' + token },
    //         success: function (data) {
    //             console.log(data);
    //         }
    //     });
    // })
})