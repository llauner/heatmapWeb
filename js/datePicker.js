window['moment-range'].extendMoment(moment);                      // Extend moment with moment-range 

const AvailableDayFormat = "YYYY_MM_DD";
const datePickerFormat = "DD-MM-YYYY";

var _availableTracks = null;            // List of available days


/**
 * discoverAvailableTracks
 * @param {any} silent
 */
function discoverAvailableDays() {
    var availableDaysUrl = IgcRestApiEndpoint + IgcRestApiProcessedHeatmapDaysUrl;

    $.ajax({
        url: availableDaysUrl,
        type: 'GET',
        context: document.body,
        dataType: "json",
        success: function (result) {
            _availableDays = result.result;
            if (_availableDays.length == 0) {
                toastr["error"]("No Heatmap days available !");
            }
            else {
                setupDatePicker();
                selectLatestDay();		// Get latest track by default
            }
        },
        error: function (result, status, errorThrown) {
            console.log(errorThrown);
            toastr["error"]("Could not load Heatmap: " + availableDaysUrl);
        },
        complete: function (jqXHR, textStatus) {
        }
    });

}

function setupDatePicker() {
    // Start + end date
    var startDate = trackToPicker(_availableDays[0]);
    var endDate = trackToPicker(_availableDays[_availableDays.length - 1]);

    var momentStart = moment(startDate, datePickerFormat);
    var momentEnd = moment(endDate, datePickerFormat);

    // Dates to disable
    var missingDays = [];

    const availableRange = moment.range(momentStart, momentEnd);

    for (let day of availableRange.by('day')) {
        d = day.format(AvailableDayFormat);
        var isDayProcessed = _availableDays.includes(d);
        if (!isDayProcessed) {
            missingDays.push(day.format(datePickerFormat));
        }
    }

    // Create date picker
    var datePicker = $("#datepicker").datepicker({
        autoclose: true,
        format: 'dd-mm-yyyy',
        startDate: startDate,
        endDate: endDate,
    });

    $('#datepicker').datepicker('setDate', endDate);
    $('#datepicker').datepicker('setDatesDisabled', missingDays);

    // --- Events 
    datePicker.on('changeDate', function (e) {
        var newTrackDate = moment(e.date).format(datePickerFormat);
        console.debug(`New track day selected:${newTrackDate}`);

        selectTrack(newTrackDate);
    });
}


/**
 * selectTrack
 * @param {any} pickerDate
 */
function selectLatestDay(pickerDate) {
    var targetAvailableDay = null;
    if (!pickerDate) {
        targetAvailableDay = _availableDays[_availableDays.length - 1];
    }
    else {
        targetAvailableDay = pickerToTrack(pickerDate);
    }

    _selectedDayFilenames = getFilenamesForTargetDate(targetAvailableDay);

    //showHideVectorTracks(false);
    //setupVectorTracks();
    //setupTracksMetadata();
}




function trackToPicker(availableTrackDay) {
    return startDate = moment(availableTrackDay, AvailableDayFormat).format(datePickerFormat);
}

function pickerToTrack(pickerDay) {
    return startDate = moment(pickerDay, datePickerFormat).format(AvailableDayFormat);
}