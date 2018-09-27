$(function () {
    $("#loginForm").submit(function () {
        $.ajax({
            url: activoteGlobal.sitePath + "Person/sendLoginEmail",
            data: { email: $("#txtEmail").val() },
            method: "POST",
            success: function (data) {
                if (data.success) {
                    alert("Email sent");
                }
                else {
                    alert("Error sending: " + data.msg);
                }
            }
        })

        return false;
    });
});