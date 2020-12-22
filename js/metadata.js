function loadMetadata() {
    // ----- Load MetaData -----
    $.ajax({
        url: metadataJsonSourceUrl,
        type: 'GET',
        context: document.body,
        success: function (result) {
            // Get result metadata
            metadata = result;
            metaDataTargetDate = moment(metadata.targetDate, "YYYY_MM_DD");
            targetDate = metaDataTargetDate;
            startDate = moment(metadata.startDate, "YYYY_MM_DD HH:mm:ss");

            targetDateToDisplay = metaDataTargetDate.format("DD/MM/YYYY");
            startDateToDisplay = moment(startDate).format("DD/MM/YYYY HH:mm:ss");
            duration = metadata.duration;
            flightsCount = metadata.flightsCount;
            thermalsCount = metadata.thermalsCount;

            // --- Init interface ---
            // --- Populate information panel
            $('#target-date').html(targetDateToDisplay);
            $('#start-date').html(startDateToDisplay);
            $('#duration').html(duration);
            $('#flights-count').html(flightsCount);
            $('#thermals-count').html(thermalsCount);
        },
        error: function (result, status, errorThrown) {
            console.log(errorThrown);

            // --- Init interface ---
            // Populate information panel
            var targetDateToDisplay = moment(targetDate).format("DD/MM/YYYY");
            $('#target-date').html(targetDateToDisplay);
            toastr["error"]("Pas de carte disponibe pour ce jour: " + targetDateToDisplay);
        }
    });



}