$(function () {
    action.registered = {};
    action.currentActionTag = "Registered";
    action.registered.loadCheckReg = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_CheckRegistration",            
            success: function (data) {
                $("#" + targetDiv).html(data);
                action.activateDiv(targetDiv);
                if (action.state != null) {
                    $("#slState").val(action.state);
                }
            }
        });
    };

    action.registered.registrationConfirmed = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/RegistrationConfirmed",
            method: "POST",
            success: function (data) {
                if (!data.success) {
                    alert("Failed to confirm registration");
                }
            }
        });

        action.loadUploadImg(targetDiv);
    }

    action.registered.stateSelected = function () {
        if ($("#slState").val() != "") {
            window.open($("#slState option:selected").data("url"));
        }
    }
});