﻿$(function () {
    action.registered = {};
    action.currentActionTag = "Registered";

    action.registered.start = function () {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_IsRegistered",
            success: function (data) {
                action.showNextStep(data);
            }
        });
    }

    action.registered.loadCheckReg = function () {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_CheckRegistration",            
            success: function (data) {
                action.showNextStep(data);
                if (action.state != null) {
                    $("#slState").val(action.state);
                }
            }
        });
    };

    action.registered.registrationConfirmed = function () {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/RegistrationConfirmed",
            method: "POST",
            success: function (data) {
                if (!data.success) {
                    alert("Failed to confirm registration");
                }
            }
        });

        action.loadUploadImg();
    }

    action.registered.stateSelected = function () {
        if ($("#slState").val() != "") {
            window.open($("#slState option:selected").data("url"));
        }
    }
});