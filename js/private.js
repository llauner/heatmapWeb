var authenticationUrl = HeatmapRestAPIEndpoint + "/auth";
var airspaceForFileUrl = HeatmapRestAPIEndpoint + "/airspace/file/igc";
var airspaceForNetcoupeFlightUrl = HeatmapRestAPIEndpoint + "/airspace/netcoupe/";

function checkAuthentication(apiKey) {
	jsonApiKey = { x_api_key: apiKey }

	// ----- Check authentication -----
	$.ajax({
		url: authenticationUrl,
		type: 'POST',
		context: document.body,
		contentType: "application/json",
		accept: "application/json",
		data: JSON.stringify(jsonApiKey),
		success: function (result) {
			toastr["success"]("Extra features enabled !", "Authentication OK");
			// Authentication successful
			isAuthenticated = true;
			xApiKey = apiKey;
			enableExtraFeatures();
		},
		error: function (jqXHR, textStatus, errorThrown) {
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
	$('#airspace-spinner').removeClass('d-none');	// Show spinner
	$.ajax({
		url: airspaceForFileUrl,
		type: 'POST',
		data: secondRequestContent,
		enctype: 'multipart/form-data',
		processData: false,
		contentType: false,
		headers: {
			'x-api-key': xApiKey
		},
		success: function (result) {
			showInfringedAirspace(result.geojsonInfringedAirspace);
			showInfringedAirspaceMarkers(result.geojsonInfringedPoints);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			toastr["error"](jqXHR.responseText, "Getting airspace for file failed !");
			console.log(jqXHR);
		},
		complete: function (ataOrjqXHR, textStatus, jqXHROrerrorThrown) {
			$('#airspace-spinner').addClass('d-none');	// Hide spinner
		}
	});
}

function getAirspaceForNetcoupeFlight(netcoupeFlightId) {
	airspaceForNetcoupeFlightUrl = airspaceForNetcoupeFlightUrl + netcoupeFlightId;
	// Subnit second request
	$('#airspace-spinner').removeClass('d-none');	// Show spinner
	$.ajax({
		url: airspaceForNetcoupeFlightUrl,
		type: 'GET',
		accept: "application/json",
		headers: {
			'x-api-key': xApiKey
		},
		success: function (result) {
			showInfringedAirspace(result);
			showInfringedAirspaceMarkers(result);

		},
		error: function (jqXHR, textStatus, errorThrown) {
			toastr["error"](jqXHR.responseText, "Getting airspace for Netcoupe flight failed. Id=" + netcoupeFlightId);
			console.log(jqXHR);
		},
		complete: function (ataOrjqXHR, textStatus, jqXHROrerrorThrown) {
			$('#airspace-spinner').addClass('d-none');	// Hide spinner
		}
	});
}

/**
 * showInfringedAirspace
 * Show the inforgined Airspaces on the map
 * @param {*} infringedAirspaceGeojson
 */
function showInfringedAirspace(infringedAirspaceGeojson) {
	// Add map source
	map.addSource('infringed-airspace',
		{
			type: 'geojson',
			data: infringedAirspaceGeojson
		});
	// --- Add layers ---
	// Infringed airspace
	map.addLayer(INFRINGED_AIRSPACE_LAYER_DEFINITION);

	// Infringed airspace labels
	var infringedAirspaceLabelLayerDefinition = {};
	Object.assign(infringedAirspaceLabelLayerDefinition, AIRSPACE_LABEL_LAYER_DEFINITION);
	infringedAirspaceLabelLayerDefinition.id = "layer-infringed-airspace-label";
	infringedAirspaceLabelLayerDefinition.source = "infringed-airspace";
	map.addLayer(infringedAirspaceLabelLayerDefinition);
};

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