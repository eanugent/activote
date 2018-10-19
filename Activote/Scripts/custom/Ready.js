$(function () {
    action.ready = {};
    action.currentActionTag = "Ready";

    action.ready.clearAddress = function(){
        $("#selectAddress").val('');
        $(".info-card").removeClass("active");
    }

    action.ready.start = function () {
        gtag('event', 'Started', {
            'event_category': 'Ready'
        });

        $.ajax({
            url: activoteGlobal.sitePath + "Action/_Ready",
            success: function (data) {
                action.showNextStep(data);
                action.ready.selectAdd = new google.maps.places.Autocomplete(document.getElementById('selectAddress'), null);
                action.ready.selectAdd.addListener("place_changed", function () {
                    gtag('event', 'Selected Address', {
                        'event_category': 'Ready'
                    });

                    $(".info-card").removeClass("active");
                    //action.ready.selectAdd.setFields(['structured_address']);
                    //var place = action.ready.selectAdd.getPlace();
                    action.ready.selectedAddress = $("#selectAddress").val(); //place.formatted_address != undefined ? place.formatted_address : place.name;
                    $("#spSelectedAddress").html(action.ready.selectedAddress);

                    $.ajax({
                        url: 'https://www.googleapis.com/civicinfo/v2/voterinfo',
                        method: 'GET',
                        data: {
                            key: 'AIzaSyDDQAMdfqImWpKIHvkWfn4SUmzZkjYyUhs',
                            address: action.ready.selectedAddress
                        },
                        success: function (pData) {
                            if (pData.pollingLocations != undefined && pData.pollingLocations.length > 0) {
                                $("#card-polling-place").addClass("active");
                                $("#card-registration").addClass("active");

                                var pAdd = pData.pollingLocations[0].address;

                                $.ajax({
                                    url: activoteGlobal.sitePath + "Action/StateRegistrationURL/" + pAdd.state,
                                    success: function (stURL) {
                                        $("#aCheckRegLink").attr("href", stURL);
                                    }
                                });

                                $("#spPollLocation").html(pAdd.locationName);
                                $("#spPollAddressLine1").html(pAdd.line1);
                                $("#spPollAddressLine2").html(pAdd.city + ", " + pAdd.state + " " + pAdd.zip);
                                $("#spPollHours").html(pData.pollingLocations[0].pollingHours);
                                $("#aAddToCalendar").attr("href", activoteGlobal.sitePath + "Home/GetICal?tzOffset=" + new Date().getTimezoneOffset().toString() + "&line1=" + encodeURIComponent(pAdd.line1) + "&city=" + encodeURIComponent(pAdd.city) + "&state=" + encodeURIComponent(pAdd.state) + "&zip=" + encodeURIComponent(pAdd.zip) + "&locationName=" + encodeURIComponent(pAdd.locationName));
                                $("#aGetDirections").attr("href", "https://www.google.com/maps/place/" + encodeURIComponent(pAdd.line1 + ", " + pAdd.city + ", " + pAdd.state + " " + pAdd.zip));
                            }
                            else {
                                $("#card-no-info").addClass("active");
                            }

                            if (pData.earlyVoteSites != undefined && pData.earlyVoteSites.length > 0) {
                                //action.ready.geocoder = new google.maps.Geocoder();

                                //action.ready.geocoder.geocode({ 'address': action.ready.selectedAddress },
                                //    function (results, status) {
                                //        if (status == 'OK') {
                                //            action.ready.evMap = new google.maps.Map(document.getElementById('dvEarlyVoteMap'), { zoom: 8, center: results[0].geometry.location });
                                //            $("#dvEarlyVoteMap").css("overflow", "visible");
                                //            var marker = new google.maps.Marker({
                                //                map: action.ready.evMap,
                                //                position: results[0].geometry.location,
                                //                label: 'Home',
                                //                animation: google.maps.Animation.DROP
                                //            });
                                //        } else {
                                //            alert('Geocode was not successful for the following reason: ' + status);
                                //        }
                                //    });
                                $("#card-early-voting").addClass("active");
                                if ($("#early-voting-cards").hasClass("slick-initialized")) {
                                    $("#early-voting-cards").slick("unslick");
                                    $("#early-voting-cards").html('');
                                }

                                $('#early-voting-cards').slick({
                                    infinite: false,
                                    variableWidth: true,
                                    slidesToShow: 2,
                                    slidesToScroll: 1,
                                    swipeToSlide: true,
                                    responsive: [
                                        {
                                            breakpoint: 767.98,
                                            settings: {
                                                infinite: false,
                                                slidesToShow: 1,
                                                slidesToScroll: 1,
                                                swipeToSlide: true,
                                                arrows: false,
                                            }
                                        }
                                    ]
                                });

                                $.each(pData.earlyVoteSites, function (index, value) {
                                    value.address.pollingHours = value.pollingHours;
                                    var evAdd = value.address;
                                    $.ajax({
                                        url: activoteGlobal.sitePath + "Action/_EarlyVotingLoc",
                                        type: "POST",
                                        data: JSON.stringify(value.address),
                                        contentType: "application/json; charset=utf-8",
                                        success: function (evData) {
                                            $("#early-voting-cards").slick("slickAdd", evData);
                                        }
                                    });

                                    //action.ready.geocoder.geocode({ 'address': evAdd.line1 + ', ' + evAdd.city + ', ' + evAdd.state + ' ' + evAdd.zip },
                                    //    function (results, status) {
                                    //        if (status == 'OK') {
                                    //            var marker = new google.maps.Marker({
                                    //                map: action.ready.evMap,
                                    //                position: results[0].geometry.location,
                                    //                label: value.address.locationName,
                                    //                animation: google.maps.Animation.DROP
                                    //            });
                                    //        } else {
                                    //            alert('Geocode was not successful for the following reason: ' + status);
                                    //        }
                                    //    });
                                });
                            }
                        },
                        error: function () {
                            $("#card-bad-address").addClass("active");
                        }
                    });
                });
            }
        });
    };

    action.ready.earyVoteMoreInfo = function (name, line1, line2, hours) {

        $("#evMoreInfoName").html(name);
        $("#evMoreInfoAdd1").html(line1);
        $("#evMoreInfoAdd2").html(line2);
        $("#evMoreInfoHours").html(hours);

        $("#evMapsLink").attr("href", "https://www.google.com/maps/place/" + encodeURIComponent(line1 + ", " + line2));

        $("#dvEarlyVoteMoreInfo").addClass("active");
    }
});