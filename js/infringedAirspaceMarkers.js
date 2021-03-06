var INFRINGED_AIRSPACE_MARKERS_LAYER_DEFINITION = {
	"id": "layer-infringed-airspace-markers",
	"type": "symbol",
	"source": "infringed-airspace-markers",
	"layout": {
		"icon-image": "road-closure",
		"icon-allow-overlap": true
	},
	"paint": {}
};

function showInfringedAirspaceMarkers(infringedAirspaceMarkersGeojson) {
	// Add map source
	map.addSource('infringed-airspace-markers',
		{
			type: 'geojson',
			data: infringedAirspaceMarkersGeojson
		});
	// --- Add layers ---
	// Infringed airspace markers
	map.addLayer(INFRINGED_AIRSPACE_MARKERS_LAYER_DEFINITION);
	setupMarkerPopup();
};

function setupMarkerPopup() {
	// When a click event occurs on a feature in the places layer, open a popup at the
	// location of the feature, with description HTML from its properties.
	map.on('click', 'layer-infringed-airspace-markers', function (e) {
		var coordinates = e.features[0].geometry.coordinates.slice();
		var properties = e.features[0].properties;

		// Build description
		var ceiling = properties.CEILING;
		var ceilingFt = 0;
		if (ceiling.includes("FL")) {
			ceiling = ceiling.replace("FL", "");
			ceilingFt = parseInt(ceiling) * 100;
		}

		var floor = properties.FLOOR;
		var floorFt = 0;
		if (floor.includes("FT")) {
			floor = floor.replace(/\D/g, '');

			floorFt = parseInt(floor);
		}
		if (floor.includes("FL")) {
			floor = floor.replace(/\D/g, '');
			floorFt = parseInt(floor) * 100;
		}

		var ceilingInM = parseInt(ceilingFt * 0.3048);
		var floorInM = parseInt(floorFt * 0.3048);
		var description = `
		<table>
			<tbody>
				<tr>
					<td><strong>Name</strong></td>
					<td>${properties.NAME}</td>
				</tr>
				<tr>
					<td><strong>Class</strong></td>
					<td>${properties.CLASS}</td>
				</tr>
				<tr>
					<td><strong>Ceiling / Floor</strong></td>
					<td>${properties.CEILING} / ${properties.FLOOR}</td>
				</tr>
				<tr>
					<td><strong>Ceiling / Floor</strong></td>
					<td>${ceilingInM} m / ${floorInM} m </td>
				</tr>
			</tbody>
			</table>
		`
		// Ensure that if the map is zoomed out such that multiple
		// copies of the feature are visible, the popup appears
		// over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0][0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new mapboxgl.Popup()
			.setLngLat(coordinates[0][0])
			.setHTML(description)
			.addTo(map);
	});

	// Change the cursor to a pointer when the mouse is over the places layer.
	map.on('mouseenter', 'layer-infringed-airspace-markers', function () {
		map.getCanvas().style.cursor = 'pointer';
	});

	// Change it back to a pointer when it leaves.
	map.on('mouseleave', 'layer-infringed-airspace-markers', function () {
		map.getCanvas().style.cursor = '';
	});
}