var authenticationUrl = HeatmapRestAPIEndpoint + "/auth";

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
			enableExtraFeatures();
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			console.log("Authentication error. Reponse=");
			console.log(jqXHR);
			toastr["error"](jqXHR.responseText, "Authentication failed !");
		}
	});
}

function enableExtraFeatures() {
	$(function () {
		$('#xtra-features-container').removeClass('d-none');	// Show panel
	});
	
}