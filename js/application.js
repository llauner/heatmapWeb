var trackIds = [];              // List of Netcoupe volId currently being displayed

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}


function hexToHSL(H) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return "hsl(" + h + "," + s + "%," + l + "%)";
}

// isNetcoupeFlight
// Returns: True if the flight is coming from a Netcoupe Id #
function isNetcoupeFlight(flightId) {
    var isNetcoupeFlight = !isNaN(flightId);
    return isNetcoupeFlight;
}

function isTimeLineDefined() {
    return (timelineData) ? true : false;
}

function isTimestampAvailableInHeatmap() {
    return (heatmapGeojsonData.features.length && heatmapGeojsonData.features[0].properties.ts) ? true : false;
}

function getTrackHexColor(flightId) {
    var colorIndex = trackIds.indexOf(flightId) % 10;
    return d3.schemeCategory10[colorIndex];
}

// checkFlightCanBeAdded
// Checks that the flight can be added onto the map
// = True if it's not already processed
function checkFlightCanBeAdded(flightId) {
    // Check that the flight is not alrady there
    if (trackIds.includes(flightId)) {
        toastr["error"]("Le vol est déja présent !", "Vol Netcoupe #" + flightId);
        return false;
    } else {
        trackIds.push(flightId);
        $('#lbl-id').attr('title', trackIds.join(", "));    // Add to tooltip
        return true;
    }
}

// ---------- Setup and configure the drop zone for igc upload ----------
function setupDropZone() {
    var myDropzone = new Dropzone('#igc-upload', {
        url: HeatmapRestAPIEndpoint + "/file/igc",
        maxFiles: 1,
        maxFilesize: 2,
        acceptedFiles: ".igc"
    });

    myDropzone.on("success", function (file, response) {
        myDropzone.removeAllFiles();
        trackId = file.name;
        loadFlight(trackId, response);
        
        if (isShowInfringedAirspaceOnly) getAirspaceForFile(file);
    });

    myDropzone.on("error", function (file, errorMessage, xhrResponse) {
        myDropzone.removeAllFiles();
        if (xhrResponse && xhrResponse.status === 500) {
            toastr["error"]("Erreur pendant le traitement du fichier: " + file.name);
        }
        else if (xhrResponse && xhrResponse.status === 400) {
            toastr["error"]("Fichier non valide: " + file.name, errorMessage.error);
        }
        else {
            toastr["error"](errorMessage.error, "ok");
        }
    });

    myDropzone.on("addedfile", function (e) {
        //var flightId = e.dataTransfer.files[0].name;
        var flightId = e.name;
        if (!checkFlightCanBeAdded(flightId)) {
            myDropzone.removeAllFiles();
        }
    });

}



// ---------- Setupd and configure glider icon on map ---------
var isGliderIconLoaded = false;
function setupGliderIconOnTrack(originLocation, flightId) {
    // A single point that animates along the route.
    // Coordinates are initially set to origin.
    gliderIconPoint.features[0].geometry.coordinates = originLocation;

    map.addSource('glider-point', {
        'type': 'geojson',
        'data': gliderIconPoint
    });

    var haloColor = getTrackHexColor(flightId);

    map.loadImage("/images/glider.png",
        function(error0, image0) {
            if (error0) throw error0;

            if (!isGliderIconLoaded) {
                map.addImage("image",
                    image0,
                    {
                        "sdf": "true"
                    });
                isGliderIconLoaded = true;
            }

            map.addLayer({
                "id": "layer-glider-point",
                'source': 'glider-point',
                "type": "symbol",
                "layout": {
                    "icon-image": "image",
                    "icon-allow-overlap": true,
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-ignore-placement': true,
                    'icon-size': 0.5
                },
                "paint": {
                    "icon-color": "#ffffff",
                    "icon-halo-color": haloColor,
                    "icon-halo-width": 2
                }
            });
        });


}

// ----------------------------------------------------- Glider Track ---------------------------------------------------------

// --- addTrackToMap ---
// Add the track onto the map
function addTrackToMap(geojsontrack, flightId) {
    var isNetcpFlight = isNetcoupeFlight(flightId);

    // --- Add data source ---
    map.addSource('source-flight-track' + flightId, {
        type: 'geojson',
        tolerance: 0,
        data: geojsontrack
    });

    // Pick color for the new layer:
    var hslColor = hexToHSL(getTrackHexColor(flightId));

    map.addLayer(
        {
            "id": "flight-track-" + flightId,
            "type": "line",
            "source": "source-flight-track" + flightId,
            "layout": {},
            "paint": { "line-color": hslColor, "line-width": 3 }
        }
    );

    map.triggerRepaint();

    // Toastr feedback
    var message = (isNetcpFlight) ? "Vol Netcoupe #" : "Fichier igc: ";
    toastr["success"](message + flightId, "Vol chargé");

    // Update timelinme
    if (!isTimeLineDefined()) {
        timelineGeojsonTrack = geojsontrack;
        addTrackToTimeline(geojsontrack, flightId);
    }

    // Check if the added track is on the same date as the heatmap
    var trackDate = moment.unix(geojsontrack.features[0].properties.ts).startOf('day');
    var isTrackOnTargetDate = targetDate.isSame(trackDate);
    if (!isTrackOnTargetDate) {
        var _targetDate = targetDate.format("DD/MM/YYYY");
        var _trackDate = trackDate.format("DD/MM/YYYY");
        toastr["warning"](_targetDate + " | " + _trackDate, "Dates heatmap | vol différentes", { closeButton: true, timeOut: 3000 });
    }

}

// ----------------------------------------------------- Glider Timeline -----------------------------------------------------
function isShowTimelineChecked() {
    return $('#switch-navigator').is(':checked');
}
function addTrackToTimeline(geojsontrack, flightId) {
    var isShowTimeline = isShowTimelineChecked();

    if (isShowTimeline) {
        var data = _.map(geojsontrack.features,
            function (f) {
                var prop = f.properties;
                // Turn ts into hour
                var epoch = moment(prop.ts * 1000);
                var ts = epoch.format();
                return { x: ts, y: prop.alt, group:0 };
            });

        setupAltitudeChart(geojsontrack, data, flightId);   // Setup the altitude chart

        // Hide switch as it's now useless
        $('#switch-navigator-container').addClass('d-none');
    }
}

// ---------- Setup altitude chart ----------
function setupAltitudeChart(geojsontrack, data, flightId) {
    // Show container
    $("#flight-timeline").removeClass('d-none');
    // Setup graph
    var container = document.getElementById("visualization");

    var dataset = new vis.DataSet(data);
    timelineData = data;

    var options = {
        showCurrentTime: false,
        moveable: true,
        zoomable: true,
        height: "200px",
        drawPoints: false,
        timeAxis: { scale: 'hour', step: 1 },
        dataAxis: {
            left: {
                range: { min: 0 },
                title: { text: "Altitude" }
            }
        },
        start: moment(data[0].x).add(-15, "minutes").format(),
        end: moment(data.pop().x).add(15, "minutes").format(),
        format: {
            majorLabels: {
                hour: 'D/MM/YYYY'
            }
        }

    };
    timelineVisGraph2d = new vis.Graph2d(container, dataset, options);

    // Add Custom vertical line
    timelineVisGraph2d.addCustomTime(data[0].x);

    // Add Glider icon on track
    var trackFeature = geojsontrack.features[0];
    var point = trackFeature.geometry.coordinates[0];
    setupGliderIconOnTrack(point, flightId);

    // Simulate time change so that the info is updated
    graphTimeChangeHandler({ time: moment(geojsontrack.features[0].properties.ts * 1000) }); 

    // Change color to match the track color
    var hexTrackColor = getTrackHexColor(flightId);
    $('.vis-graph-group0').css('stroke', hexTrackColor);

    // --- Event: timechange ---
    timelineVisGraph2d.on('timechange', function(e) {
        graphTimeChangeHandler(e);
    });
}

function graphTimeChangeHandler(e) {
    lastGraphTimeChangeEvent = e;   // Store last event so that we can re-apply the filters later

    var selectedTime = moment(e.time);
    var dataIndex = _.findIndex(timelineData, function (d) { return moment(d.x).isSameOrAfter(selectedTime); });

    if (dataIndex !== -1) {
        var targetData = timelineData[dataIndex];
        var trackFeature = timelineGeojsonTrack.features[dataIndex];
        var point = trackFeature.geometry.coordinates[0];
        var point2 = trackFeature.geometry.coordinates[1];

        var currentTime = selectedTime.format('HH:mm:ss');
        var currrentAltitude = targetData.y;

        // --- Update the glider icon location
        gliderIconPoint.features[0].geometry.coordinates = point;
        // Bearing
        gliderIconPoint.features[0].properties.bearing = turf.bearing(turf.point(point), turf.point(point2));

        map.getSource('glider-point').setData(gliderIconPoint);

        // --- Update time and latitude indication
        $labelTrackTime.html(currentTime);
        $labelTrackAltitude.html(currrentAltitude);

        // --- Update the heatmap time filter ---
        // Compute projected target moment = same hour but on the targetDate
        if (isHeatmapTimeFilterOn) {
            var epochSelectedTime = selectedTime.unix();
            var selectedDate = selectedTime.startOf('day').unix();
            var secondsAfterSelectedDate = epochSelectedTime - selectedDate;
            var projectedEpoch = targetDate.unix() + secondsAfterSelectedDate;

            filterBy(varioFilterValue, altInFilterValue, projectedEpoch);
        }
    }
}

// ---------- Delete glider icon and altitude chart ----------
function deleteIconAndTimeline() {

    // Destroy timeline
    timelineGeojsonTrack = null;
    timelineData = null;

    timelineVisGraph2d.destroy();       // Destroy the graph2d

    // Destroy glider icon
    map.removeLayer('layer-glider-point');
    map.removeSource('glider-point');

    // Show switch as it's now usefull
    $('#switch-navigator-container').removeClass('d-none');
}