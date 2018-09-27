var action = {};

$(function () {
    $.ajax({
        url: "https://ipapi.co/json/",
        success: function (data) {
            if (data != null && data.region_code != null) {
                action.state = data.region_code;
            }
        }
    });

    action.activateDiv = function (id) {
        $(".screen").removeClass("active");
        $("#" + id).addClass("active");
    }

    if ($("#InitView").length > 0) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/" + $("#InitView").val(),
            success: function (data) {
                $("#dv1").html(data);
                action.activateDiv("dv1");
            }
        })
    }

    action.loadUploadImg = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_UploadImageView",
            success: function (data) {
                $("#" + targetDiv).html(data);
                action.activateDiv(targetDiv);
            }
        });
    };

    action.imageUploaded = function (targetDiv) {
        var reader = new FileReader();
        var file = $("#uploadPic")[0].files[0];

        reader.onloadend = function () {
            $.ajax({
                url: activoteGlobal.sitePath + "Action/_ChooseFrame",
                data: { actionTag: action.currentActionTag },
                method: "POST",
                success: function (data) {
                    $("#" + targetDiv).html(data);
                    action.initImgEditor(reader.result);
                    action.activateDiv(targetDiv);
                }
            });
        }
        if (file) {
            reader.readAsDataURL(file);
        }
    }

    action.initImgEditor = function (imgData) {

        var options = {
            imageUrls: [
                { url: imgData, closeButtonRequire: false, clickToSelect: true },
                { url: activoteGlobal.sitePath + 'Home/Frame/?actionTag=' + action.currentActionTag, closeButtonRequire: false, clickToSelect: false }
            ],
            width: $("#imgEditor").width(),
            height: $("#imgEditor").width()
        };
        action.imgEditor = $('#imgEditor').ImageEditor(options);
        $("#imgEditor span").css("transition", "all 0.25s ease-out 0s");
    };

    action.adjustScale = function (isIncrease) {
        action.imgEditor.selectImage(0);
        if (isIncrease) {
            $('#imgScale').val(function (i, val) {
                var oldVal = Number(val);
                return oldVal < 2 ? oldVal + .05 : 2;
            });
        }
        else {
            $('#imgScale').val(function (i, val) {
                var oldVal = Number(val);
                return oldVal > .1 ? oldVal - .05 : .1;
            });
        }
        var val = $("#imgScale").val();
        action.imgEditor.scaleImage(val, val);
    };

    action.changeFrame = function (newURL) {
        action.imgEditor.setImage({ url: newURL, closeButtonRequire: false, clickToSelect: false }, 1, true);
    };

    action.chooseFrame = function (targetDiv) {
        var canvas = action.imgEditor.mergeImage();
        action.imgString = canvas.toDataURL('image/jpeg');

        var image = new Image();
        image.onload = function () {
            var dlCanvas = document.getElementById("downloadCanvas");
            image.width = 1080;
            image.height = 1080;
            
            var ctx = dlCanvas.getContext("2d");
            ctx.clearRect(0, 0, dlCanvas.width, dlCanvas.height);
            dlCanvas.width = image.width;
            dlCanvas.height = image.height;
            ctx.drawImage(image, 0, 0, image.width, image.height);
            action.imgDownloadString = dlCanvas.toDataURL("image/jpeg");
        };

        image.src = action.imgString;

        action.loadMakePicPublic(targetDiv);
    }

    action.loadMakePicPublic = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_MakePicPublic",
            success: function (data) {
                $("#" + targetDiv).html(data);
                action.activateDiv(targetDiv);
            }
        });
    };

    action.chooseMakePicPublic = function (choice, targetDiv) {
        action.makePicPublic = choice;

        if (choice) {
            $.ajax({
                url: activoteGlobal.sitePath + "Action/UploadPic",
                method: "post",
                data: { pic: action.imgString, actionTag: action.currentActionTag, __RequestVerificationToken: $("[name=__RequestVerificationToken]").val() },
                success: function (data) {

                }
            });
        }

        if (activoteGlobal.personID > 0) {
            action.loadDownloadImage(targetDiv);
        }
        else {
            action.loadSignup(targetDiv);
        }
    };

    action.loadSignup = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_Signup",
            method: "POST",
            data: { actionTag: action.currentActionTag, makePublic: action.makePicPublic, state: action.state },
            success: function (data) {
                $("#" + targetDiv).html(data);
                $("#formSignup").submit(function () {
                    $.ajax({
                        url: activoteGlobal.sitePath + ""
                    });
                });
            }
        });
    };

    action.loadDownloadImage = function (targetDiv) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_DownloadImageView",
            success: function (data) {
                $("#" + targetDiv).html(data);
                action.activateDiv(targetDiv);
                $("#finalImage").attr("src", action.imgString);
            }
        });
    }

    action.downloadImage = function () {
        $("#btnDownloadImage")[0].href = action.imgDownloadString;
    };
});