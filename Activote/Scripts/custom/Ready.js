$(function () {
    action.ready = {};
    action.currentActionTag = "Ready";

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
                    action.ready.selectAdd.setFields(['structured_address']);
                    var place = action.ready.selectAdd.getPlace();
                    var add = place.formatted_address != undefined ? place.formatted_address : place.name;
                    $("#spSelectedAddress").html(add);

                    $.ajax({
                        url: 'https://www.googleapis.com/civicinfo/v2/voterinfo',
                        method: 'GET',
                        data: {
                            key: 'AIzaSyDDQAMdfqImWpKIHvkWfn4SUmzZkjYyUhs',
                            address: add
                        },
                        success: function (pData) {
                            if (pData.pollingLocations != undefined && pData.pollingLocations.length > 0) {
                                var pAdd = pData.pollingLocations[0].address;
                                
                                $("#spPollLocation").html(pAdd.locationName);
                                $("#spPollAddressLine1").html(pAdd.line1);
                                $("#spPollAddressLine2").html(pAdd.city + ", " + pAdd.state + " " + pAdd.zip);
                                $("#spPollHours").html(pData.pollingLocations[0].pollingHours);
                                $("#aAddToCalendar").attr("href", activoteGlobal.sitePath + "Home/GetICal?tzOffset=" + new Date().getTimezoneOffset().toString() + "&line1=" + encodeURIComponent(pAdd.line1) + "&city=" + encodeURIComponent(pAdd.city) + "&state=" + encodeURIComponent(pAdd.state) + "&zip=" + encodeURIComponent(pAdd.zip) + "&locationName=" + encodeURIComponent(pAdd.locationName));
                                $("#aGetDirections").attr("href", "https://www.google.com/maps/place/" + encodeURIComponent(pAdd.line1 + ", " + pAdd.city + ", " + pAdd.state + " " + pAdd.zip));
                            }
                            else {
                                alert('Polling location not yet available');
                            }

                        }
                    });
                });
            }
        });
    };


});