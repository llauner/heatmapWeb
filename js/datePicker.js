window['moment-range'].extendMoment(moment);                      // Extend moment with moment-range 

const AvailableDayFormat = "YYYY_MM_DD";
const datePickerFormat = "DD-MM-YYYY";

var _availableDays = null;                                      // List of available days
var _selectedDayFilenames = null;



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
                selectDay();		// Get latest track by default
                setupDatePicker();
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

/**
 * selectTrack
 * @param {any} pickerDate
 */
function selectDay(pickerDate) {
    var targetAvailableDay = null;
    if (!pickerDate) {
        targetAvailableDay = _availableDays[_availableDays.length - 1];
    }
    else {
        targetAvailableDay = pickerToTrack(pickerDate);
    }

    targetDate = targetAvailableDay;
    _selectedDayFilenames = getFilenamesForTargetDate(targetDate);
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

    $('#datepicker').datepicker('setDate', trackToPicker(targetDate));                    // Set date to targetDate
    $('#datepicker').datepicker('setDatesDisabled', missingDays);

    // --- Events 
    datePicker.on('changeDate', function (e) {
        var newTrackDate = moment(e.date);
        console.debug(`New track day selected:${newTrackDate.format(datePickerFormat)}`);

        switchDayToTargetDate(newTrackDate);
    });
}



function trackToPicker(availableTrackDay) {
    return startDate = moment(availableTrackDay, AvailableDayFormat).format(datePickerFormat);
}

function pickerToTrack(pickerDay) {
    return startDate = moment(pickerDay, datePickerFormat).format(AvailableDayFormat);
}

function targetDateToString(targetDate) {
    return moment(targetDate).format(TargetDateFormat);
}