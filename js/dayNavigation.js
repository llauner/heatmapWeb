var f = GeoJsonFileListUrl = HeatmapRestAPIEndpoint + "/json/files"

function getFileList() {
	$.ajax({
		url: GeoJsonFileListUrl,
		type: 'GET',
		context: document.body,
		success: function (result) {
			// Get result metadata
			fileList = result.jsonFileList;
			dateList = _.map(fileList, function(e) {
				return moment(e.substr(0,10), TargetDateFormat);    // Keep date element only
			});
			availableMetadataDates = dateList;
			enableNavigationArrows();		// Enable / Disable navigation arrows depending on availability of previous / next day
		},
		error: function (result, status, errorThrown) {
			console.log(errorThrown);
			toastr["error"]("Impossible de recuperler la liste des fichiers geoJson");
		}
	});
}

/**
 * getNextAvailableDate
 * Get the next available heatmap available date
 * @param {currentDate}   var           The initial source date
 * @return {moment}|null 				Return the next available date or null if none available
 */
function getNextAvailableDate(currentDate) {
	nextDate = _.find(availableMetadataDates, function(e) {
		return moment(e).isAfter(currentDate);
	});
	return nextDate;
}
function hasNextDate(currentDate) {
	return getNextAvailableDate(currentDate);
}

/**
 * getPreviousAvailableDate
 * Get the previous available heatmap available date
 * @param {currentDate}   var           The initial source date
 * @return {moment}|null 				Return the previous available date or null if none available
 */
function getPreviousAvailableDate(currentDate) {
	nextDate = _.findLast(availableMetadataDates, function(e) {
		return moment(e).isBefore(currentDate);
	});
	return nextDate;
}
function hasPreviousDate(currentDate) {
	return getPreviousAvailableDate(currentDate);
}

// Reload the page for the next / previous day
function reloadPage(deltaDay) {
	if (deltaDay>0)
		newTargetDate = getNextAvailableDate(targetDate);
	else
		newTargetDate = getPreviousAvailableDate(targetDate);

	//newTargetDate = targetDate.add(deltaDay, 'd');
	if (newTargetDate) {
		dayParam = newTargetDate.format(TargetDateFormat);
	location.href = '?day=' + dayParam;
	}
	
}
// ------------------ UI related ------------------
function enableNavigationArrows() {
	// Next Day
	if (hasNextDate(targetDate)) {
		$('#btn-day-forward').removeClass('disabled-button');
	}
	else {
		$('#btn-day-forward').addClass('disabled-button');
	}
	// Previous Day
	if (hasPreviousDate(targetDate)) {
		$('#btn-day-backward').removeClass('disabled-button');
	}
	else {
		$('#btn-day-backward').addClass('disabled-button');
	}
}

