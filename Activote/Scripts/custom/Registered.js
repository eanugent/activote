$(function () {
    action.registered = {};

    action.registered.loadCheckReg = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_CheckRegistration",
            success: function (data) {
                $("#" + targetDiv).html(data);
                if (action.registered.state != null) {
                    $("#slState").val(action.registered.state);
                }
            }
        });
    };

    action.registered.stateSelected = function () {
        if ($("#slState").val() != "") {
            window.open($("#slState option:selected").data("url"));
        }
    }

    action.registered.loadUploadImg = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_UploadImageView",
            success: function (data) {
                $("#" + targetDiv).html(data);
            }
        });
    };

    action.registered.imageUploaded = function (targetDiv) {
        var reader = new FileReader();
        var file = $("#uploadPic")[0].files[0];

        reader.onloadend = function () {
            $.ajax({
                url: activoteGlobal.sitePath + "Action/_ChooseFrame",
                data: { actionTag: "Registered" },
                method: "POST",
                success: function (data) {
                    $("#" + targetDiv).html(data);
                    action.registered.initImgEditor(reader.result);
                }
            });
        }
        if (file) {
            reader.readAsDataURL(file);
        } 
    }

    action.registered.initImgEditor = function(imgData){
        
        var options = {
            imageUrls: [
                { url: imgData, closeButtonRequire: false, clickToSelect: true },
                { url: activoteGlobal.sitePath + 'Content/frames/registered.png', closeButtonRequire: false, clickToSelect: false }
            ],
            width: $("#imgEditor").width(),
            height: $("#imgEditor").width()
        };
        action.registered.imgEditor = $('#imgEditor').ImageEditor(options); 
    };

    action.registered.changeFrame = function(newURL){
        action.registered.imgEditor.setImage({ url: newURL, closeButtonRequire: false, clickToSelect: false }, 1, true);
    };

    action.registered.loadMakePublic = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_MakePicPublic",
            success: function (data) {
                $("#" + targetDiv).html(data);
            }
        });
    };

    action.registered.loadSignup = function (targetDiv, makePublic) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_Signup",
            method: "POST",
            data: { actionTag: "Registered", makePublic: makePublic, state: action.registered.state },
            success: function (data) {
                $("#" + targetDiv).html(data);
                $("#formSignup").submit(function () {
                    $.ajax({
                        url: activoteGlobal.sitePath + ""
                    })
                });
            }
        });
    };

    action.registered.downloadImage = function () {
        var wd = $("#imgEditor").width();
        var scale = 1080 / wd;
        var canvas = action.registered.imgEditor.mergeImage(1080, 1080, scale);
        var dt = canvas.toDataURL('image/jpeg');
        $("#btnDownloadImage")[0].href = dt;   
    };

    $.ajax({
        url: "https://ipapi.co/json/",
        success: function (data) {
            if (data != null && data.region_code != null) {
                action.registered.state = data.region_code;
            }
        }
    });
});