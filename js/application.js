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
        loadNetcoupeFlight(trackId, response);
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

