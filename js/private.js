var authenticationUrl = HeatmapRestAPIEndpoint + "/auth";
var airspaceForFileUrl = HeatmapRestAPIEndpoint + "/airspace/file/igc";

function checkAuthentication(apiKey) {
	jsonApiKey = {x_api_key: apiKey}

	 // ----- Check authentication -----
	 $.ajax({
		url: authenticationUrl,
		type: 'POST',
		context: document.body,
		contentType: "application/json",
		accept: "application/json",
		data: JSON.stringify(jsonApiKey),
		success: function(result) {
			toastr["success"]("Extra features enabled !", "Authentication OK");
			// Authentication successful
			isAuthenticated = true;
			xApiKey = apiKey;
			enableExtraFeatures();
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			console.log("Authentication error. Reponse=");
			console.log(jqXHR);
			toastr["error"](jqXHR.responseText, "Authentication failed !");
		}
	});
}

function getAirspaceForFile(file) {
	// Create a new formData and append the dropzone file
	var secondRequestContent = new FormData();
	secondRequestContent.append('file', file);
	// Subnit second request
	$.ajax({
		url: airspaceForFileUrl,
		type: 'POST',
		data: secondRequestContent,
		enctype: 'multipart/form-data',
		processData: false,
        contentType: false,
		headers: {
			'x-api-key':xApiKey
		},
		success: function(result) {
			console.log(result);
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			toastr["error"](jqXHR.responseText, "Getting airspace for file failed !");
			console.log(jqXHR);
		}
	});
}

function enableExtraFeatures() {
	$(function () {
		$('#xtra-features-container').removeClass('d-none');	// Show panel
	});
}

function getXApiKeyformUrlParams(urlParams) {
	acceptedXApiKeyParams = ['x-api-key', 'apikey', 'key', 'auth', 'password']

	apiKey = null;
	for (let key of acceptedXApiKeyParams) {
		apiKey = urlParams.get(key);
		if (apiKey) break;
	}
	return apiKey;
}