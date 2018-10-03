var action = {};

$(function () {
    action.currentStep = 0;

    $.ajax({
        url: "https://ipapi.co/json/",
        success: function (data) {
            if (data != null && data.region_code != null) {
                action.state = data.region_code;
            }
        }
    });

    $(window).resize(function () {
        action.resizeImageEditor();
    });

    action.showLoading = function () {
        $("#dvLoading").addClass("loading");
    }

    action.hideLoading = function () {
        $("#dvLoading").removeClass("loading");
    }

    action.showNextStep = function (html, isOverlay) {
        if (isOverlay == null) isOverlay = false;

        if (isOverlay) {
            $("#dvOverlay").html(html);
            $("#dvOverlay").addClass("");
        }
        else {
            action.currentStep++;
            $(".screen").removeClass("active");
            var stepDiv = $(".screen[data-step=" + action.currentStep.toString() + "]");
            stepDiv.html(html);
            stepDiv.addClass("active");
        }
    };

    action.showPrevStep = function () {
        action.currentStep--;
        $(".screen").removeClass("active");
        $(".screen[data-step=" + action.currentStep.toString() + "]").addClass("active");
    };

    action.loadUploadImg = function () {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_UploadImageView",
            success: function (data) {
                action.showNextStep(data);
            }
        });
    };

    action.imageUploaded = function () {
        var reader = new FileReader();
        var file = $("#uploadPic")[0].files[0];

        reader.onloadend = function () {
            action.showLoading();
            action.usrImage = reader.result;            
            $.ajax({
                url: activoteGlobal.sitePath + "Action/_ChooseFrame",
                data: { actionTag: action.currentActionTag },
                method: "POST",
                success: function (data) {
                    action.showNextStep(data);
                    action.initImgEditor();                    
                    if ("ontouchstart" in document.documentElement) {
                          $("desktop-only").removeClass("d-md-block");
                          $("desktop-only").removeClass("d-lg-block");
                    }
                    action.hideLoading();
                }
            });
            //$.ajax({
            //    url: activoteGlobal.sitePath + "Action/UploadPic",
            //    data: { pic: imgData, actionTag: action.currentActionTag, __RequestVerificationToken: $("[name=__RequestVerificationToken]").val() },
            //    method: "POST",
            //    success: function (imgID) {
            //        $.ajax({
            //            url: activoteGlobal.sitePath + "Action/_ChooseFrame",
            //            data: { actionTag: action.currentActionTag },
            //            method: "POST",
            //            success: function (data) {
            //                $("#" + targetDiv).html(data);
            //                action.initImgEditor(activoteGlobal.sitePath + "Home/Photo/" + imgID);
            //                action.activateDiv(targetDiv);
            //            }
            //        });
            //    }
            //});

            
        }
        if (file) {
            reader.readAsDataURL(file);
        }
    }

    action.initImgEditor = function () {

        var options = {
            imageUrls: [
                { url: action.usrImage, closeButtonRequire: false, clickToSelect: true },
                { url: activoteGlobal.sitePath + 'Home/Frame/?actionTag=' + action.currentActionTag, closeButtonRequire: false, clickToSelect: false }
            ],
            width: $("#imgEditor").width(),
            height: $("#imgEditor").width(),
            onInitCompleted: function () {
                action.imgEditor.selectImage(0); // select most bottom image as current operating image
                action.usrImageOrigPoint = action.imgEditor.activeImage.centerPoint;
                console.log(action.imgEditor.activeImage.img.naturalHeight + ' x ' + action.imgEditor.activeImage.img.naturalWidth);
                action.selectedFrameID = $("#defaultFrameID").val();
            }
        };
        action.imgEditor = $('#imgEditor').ImageEditor(options);
        $("#imgEditor span").css("transition", "all 0.25s ease-out 0s");
    };

    action.adjustScale = function (isIncrease) {
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

    action.changeFrame = function (newURL, frameID, frameAuthor, frameAuthorURL) {
        action.selectedFrameID = frameID;
        $("#spFrameAuthor").html(frameAuthor);
        $("#aFrameAuthorURL").attr("href", frameAuthorURL);
        action.imgEditor.setImage({ url: newURL, closeButtonRequire: false, clickToSelect: false }, 1, false);
    };
    
    action.resizeImageEditor = function () {
        var $el = $("#imgEditor");
        if ($el.length > 0) {
            var elHeight = $el.outerHeight();
            var elWidth = $el.outerWidth();
            var elRatio = elHeight / elWidth;

            var $wrapper = $("#editor-wrapper");

            scale = $wrapper.width() / elWidth;
            wrapHeight = $wrapper.width() * elRatio;

            $wrapper.css({
                height: wrapHeight + "px"
            });

            $el.css({
                "transform": "translate(0, 0) scale(" + scale + ")",
                "transform-origin": "0px 0px 0px"
            });
        }
    };

    action.chooseFrame = function () {
        //var canvas = action.imgEditor.mergeImage();
        //action.imgString = canvas.toDataURL();

        //var image = new Image();
        //image.onload = function () {
        //    var dlCanvas = document.getElementById("downloadCanvas");
        //    image.width = 1080;
        //    image.height = 1080;

        //    var ctx = dlCanvas.getContext("2d");
        //    ctx.clearRect(0, 0, dlCanvas.width, dlCanvas.height);
        //    dlCanvas.width = image.width;
        //    dlCanvas.height = image.height;
        //    ctx.drawImage(image, 0, 0, image.width, image.height);
        //    action.imgDownloadString = dlCanvas.toDataURL("image/jpeg");
        //};

        //image.src = action.imgString;

        var picWidth = 1080, picHeight = 1080;

        var frameImg = new Image();
        frameImg.width = picWidth;
        frameImg.height = picHeight;
        frameImg.src = action.imgEditor.images[1].url;

        var usrImg = new Image();        
        usrImg.src = action.usrImage;

        var dlCanvas = $("#downloadCanvas")[0];
        dlCanvas.width = picWidth;
        dlCanvas.height = picHeight;

        var ctx = dlCanvas.getContext("2d");
        ctx.clearRect(0, 0, picWidth, picHeight);
        var w, h, sc = $("#imgScale").val();

        var xMove = ((action.imgEditor.images[0].centerPoint.x - action.usrImageOrigPoint.x) / action.imgEditor.options.width);
        var yMove = ((action.imgEditor.images[0].centerPoint.y - action.usrImageOrigPoint.y) / action.imgEditor.options.height);
        
        if (usrImg.naturalWidth > usrImg.naturalHeight) {
            w = picWidth;
            h = (usrImg.naturalHeight / usrImg.naturalWidth) * w;            
        }
        else {
            h = picHeight;
            w = (usrImg.naturalWidth / usrImg.naturalHeight) * h;        
        }

        var centerX = (xMove * picWidth) + (picWidth / 2);
        var centerY = (yMove * picHeight) + (picHeight / 2);
        var x = centerX - ((w * sc) / 2);
        var y = centerY - ((h * sc) / 2);

        ctx.scale(sc, sc);
        ctx.drawImage(usrImg, x, y, w, h);

        ctx.scale((1/sc), (1/sc));
        ctx.drawImage(frameImg, 0, 0, frameImg.width, frameImg.height);

        //action.imgDownloadString = dlCanvas.toDataURL("image/jpeg");
        action.usrImageX = x;
        action.usrImageY = y;
        action.usrImageScale = sc;
        action.usrImageWidth = w;
        action.usrImageHeight = h;

        action.loadMakePicPublic();
        //action.loadDownloadImage();
    }

    action.loadMakePicPublic = function () {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_MakePicPublic",
            success: function (data) {
                action.showNextStep(data);
            }
        });
    };

    action.chooseMakePicPublic = function (choice) {
        action.makePicPublic = choice;
        action.showLoading();
        $.ajax({
            url: activoteGlobal.sitePath + "Action/BuildImage",
            data: {
                pic: action.usrImage, actionTag: action.currentActionTag, frameID: action.selectedFrameID,
                x: action.usrImageX, y: action.usrImageY, scale: action.usrImageScale, width: action.usrImageWidth, height: action.usrImageHeight,
                makePublic: choice, __RequestVerificationToken: $("[name=__RequestVerificationToken]").val() 
            },
            method: "POST",
            success: function (data) {
                action.imgDownloadString = activoteGlobal.sitePath + "Home/Photo/" + data;                
                action.loadDownloadImage();
            }
        });
    };

    action.loadDownloadImage = function () {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_DownloadImageView",
            success: function (data) {
                action.showNextStep(data);
                $("#finalImage").attr("src", action.imgDownloadString);
                action.hideLoading();
            }
        });
    }

    action.downloadImage = function () {
        $("#btnDownloadImage")[0].href = action.imgDownloadString;
    };

    if ($("#InitView").length > 0) {
        action.showLoading();
        $.ajax({
            url: activoteGlobal.sitePath + "Action/" + $("#InitView").val(),
            success: function (data) {
                action.showNextStep(data);
                action.hideLoading();
            }
        });
    }
});