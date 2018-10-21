var action = {};

$(function () {
    action.currentStep = 0;

    //Set state by IP
    //$.ajax({
    //    url: "https://ipapi.co/json/",
    //    success: function (data) {
    //        if (data != null && data.region_code != null) {
    //            action.state = data.region_code;
    //        }
    //    }
    //});

    $(window).resize(function () {
        action.resizeImageEditor();
    });

    action.showLoading = function () {
        $("#dvLoading").addClass("loading");
    }

    action.hideLoading = function () {
        $("#dvLoading").removeClass("loading");
    }

    action.showNextStep = function (html) {
        action.currentStep++;
        $(".screen").removeClass("active");
        var stepDiv = $(".screen[data-step=" + action.currentStep.toString() + "]");
        stepDiv.html(html);
        stepDiv.addClass("active");
    };

    action.hideOverlay = function () {
        $(".overlay").removeClass("active");
    }

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

        gtag('event', 'Image Uploaded', {
            'event_category': action.currentActionTag
        });

        var reader = new FileReader();
        var file = $("#uploadPic")[0].files[0];
        EXIF.getData(file, function () {
            var orientation = this.exifdata.Orientation;
            if (orientation !== undefined) { //Need to rotate image (mobile devices)
                var can = document.createElement("canvas");
                var ctx = can.getContext('2d');
                var thisImage = new Image;
                thisImage.onload = function () {
                    can.width = thisImage.width;
                    can.height = thisImage.height;
                    ctx.save();
                    var width = can.width; var styleWidth = can.style.width;
                    var height = can.height; var styleHeight = can.style.height;
                    if (orientation) {
                        if (orientation > 4) {
                            can.width = height; can.style.width = styleHeight;
                            can.height = width; can.style.height = styleWidth;
                        }
                        switch (orientation) {
                            case 2: ctx.translate(width, 0); ctx.scale(-1, 1); break;
                            case 3: ctx.translate(width, height); ctx.rotate(Math.PI); break;
                            case 4: ctx.translate(0, height); ctx.scale(1, -1); break;
                            case 5: ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); break;
                            case 6: ctx.rotate(0.5 * Math.PI); ctx.translate(0, -height); break;
                            case 7: ctx.rotate(0.5 * Math.PI); ctx.translate(width, -height); ctx.scale(-1, 1); break;
                            case 8: ctx.rotate(-0.5 * Math.PI); ctx.translate(-width, 0); break;
                        }
                    }

                    ctx.drawImage(thisImage, 0, 0);
                    ctx.restore();
                    action.usrImage = can.toDataURL();
                    action.initImgEditor();
                }

                thisImage.src = URL.createObjectURL(file);
            }
            else {
                reader.onloadend = function () {
                    action.showLoading();
                    action.usrImage = reader.result;
                    action.initImgEditor();
                   
                }
                if (file) {
                    reader.readAsDataURL(file);
                }
            }            
        });
    }

    action.initImgEditor = function () {
        $("#uploadPic").val('');
        $("#dvChangeFrameOverlay").addClass("active");
        action.hideLoading();

        if (action.imgEditor != undefined) {
            $("#imgEditor").html("");
        }

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
                //console.log(action.imgEditor.activeImage.img.naturalHeight + ' x ' + action.imgEditor.activeImage.img.naturalWidth);
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

    action.changeFrame = function (newURL, frameID, frameAuthor, frameAuthorURL, frameBackHex) {
        gtag('event', 'Changed Frame', {
            'event_category': action.currentActionTag
        });

        action.selectedFrameID = frameID;
        $("#aFrameAuthor").html(frameAuthor);
        $("#aFrameAuthorURL").attr("href", frameAuthorURL);
        $("#imgEditor").css("background-color", frameBackHex);
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
        gtag('event', 'Frame Selected', {
            'event_category': action.currentActionTag
        });

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
        var w, h, sc = action.imgEditor.images[0].transform.scale;

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

        //ctx.scale(sc, sc);
        //ctx.drawImage(usrImg, x, y, w, h);

        //ctx.scale((1 / sc), (1 / sc));
        //ctx.drawImage(frameImg, 0, 0, frameImg.width, frameImg.height);

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
        gtag('event', 'Make Public - ' + (choice ? 'Yes' : 'No'), {
            'event_category': action.currentActionTag
        });

        action.makePicPublic = choice;
        action.showLoading();
        $("#dvLoadingPercent").show();
        $.ajax({
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                //Upload progress
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = (evt.loaded / evt.total) * 100;
                        if (percentComplete < 99) {
                            $("#spLoadingPercent").html(Math.trunc(percentComplete).toString() + "%");
                        }
                        else {
                            $("#spLoading").hide();
                            $("#spAlmostLoaded").show();
                        }
                    }
                }, false);
                return xhr;
            },
            url: activoteGlobal.sitePath + "Action/BuildImage",
            data: {
                pic: action.usrImage, actionTag: action.currentActionTag, frameID: action.selectedFrameID,
                x: action.usrImageX, y: action.usrImageY, scale: action.usrImageScale, width: action.usrImageWidth, height: action.usrImageHeight,
                makePublic: choice, __RequestVerificationToken: $("[name=__RequestVerificationToken]").val()
            },
            method: "POST",
            success: function (data) {
                action.imgDownloadString = activoteGlobal.sitePath + "Home/Photo/" + data;
                action.loadDownloadImage(data);
                $("#dvLoadingPercent").hide();
            }
        });
    };

    action.loadDownloadImage = function (id) {
        $.ajax({
            url: activoteGlobal.sitePath + "Action/_DownloadImageView/" + id,
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

action.completeInit = function () {
    $.ajax({
        url: activoteGlobal.sitePath + "Action/_ChooseFrame",
        data: { actionTag: action.currentActionTag },
        method: "POST",
        success: function (data) {
            $("#dvChangeFrameOverlay").html(data);
            if ("ontouchstart" in document.documentElement) {
                $("desktop-only").removeClass("d-md-block");
                $("desktop-only").removeClass("d-lg-block");
            }
        }
    });
}