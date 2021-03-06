﻿$(function () {
    action.registered = {};
    action.currentActionTag = "Registered";

    action.registered.start = function () {
        gtag('event', 'Started', {
            'event_category': 'Registered'
        });

        $.ajax({
            url: activoteGlobal.sitePath + "Action/_IsRegistered",
            success: function (data) {
                action.showNextStep(data);
            }
        });
    };

    action.registered.loadCheckReg = function () {
        gtag('event', 'Check Registration', {
            'event_category': action.currentActionTag
        });

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
        gtag('event', 'Confirmed Registration', {
            'event_category': action.currentActionTag
        });
                
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
    };

    action.registered.stateSelected = function () {
        if ($("#slState").val() != "") {
            //window.open($("#slState option:selected").data("url"));
            $("#aCheckRegLink").attr("href", $("#slState option:selected").data("url"));
            $("#registeredStateImg").attr("src", activoteGlobal.sitePath + "Content/img/states/" + $("#slState option:selected").data("image") + ".svg");

            $("#dvCheckRegOverlay").addClass("active");            
        }
    };

    action.registered.launchStateSite = function () {
        gtag('event', 'Launched State Site', {
            'event_category': action.currentActionTag
        });        

        var url = $("#slState option:selected").data("url");
        if (url != null) {            
            action.registered.hideCheckReg();
            window.open(url);
        }
    }

    action.registered.hideCheckReg = function () {
        action.hideOverlay();
        action.showPrevStep();
    }
});