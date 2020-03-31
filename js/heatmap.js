mapboxgl.accessToken = 'pk.eyJ1IjoibHVkb3ZpY2xhdW5lciIsImEiOiJjazVtNzdvYzkwdTMzM2txa2xvaXJ0ZnY3In0.G6nft9RJo94MHqOOmIaYwA';

// Check if the Mapbox-GL style is loaded.
function checkIfMapboxStyleIsLoaded() {
    if (map.isStyleLoaded()) {
      return true; // When it is safe to manipulate layers
    } else {
      return false; // When it is not safe to manipulate layers
    }
  };

gliderIconPoint = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'Point',
                'coordinates': null
            }
        }
    ]
};

/**
 * filterBy
 *
 * Filters heatmap by various parameters
 *
 *
 * @param {float}   vario                
 * @param {int}     altitude            
 * @param {epoch}   [projectedTimestamp] The timestamp from the timeline as if it was for the same hour of the day on the heatmap day
 */
function filterBy(vario, altitude, projectedTimestamp) {
    // Add updated filters
    var filters = ['all',
        ['>=', 'vario', vario],
        ['>=', 'alt_in', altitude]
    ];

    if (projectedTimestamp) {
        var timeDelta = heatmapTimeFilterToleranceValue * 60;
        var epochStart = projectedTimestamp - timeDelta;
        var epochEnd = projectedTimestamp + timeDelta;

        filters.push(['>=', 'ts', epochStart]);
        filters.push(['<=', 'ts', epochEnd]);
    }

    map.setFilter('layer-heatmap', filters);
    map.setFilter('layer-vario-value', filters);

    // Set the labels
    $('#vario-label').html(vario);
    $('#label-altitude-in').html(altitude);
}


function initHeatMap() {
    map = new mapboxgl.Map({
        container: 'map',           // container id
        style: "styles/style.json"
    });

    map.on('load',
        function () {

            // Sycnhronously load Geojson data for the heatmap
            $.ajax({
                url: geojsonTargetDataSourceUrl,
                type: 'GET',
                context: document.body,
                dataType: "json",
                success: function (result) {
                    if (typeof(result) !== 'object') {
                        result = JSON.parse(result);
                    }
                    onHeatmapDataLoaded(result);
                },
                error: function (result, status, errorThrown) {
                    console.log(errorThrown);
                    //toastr["error"]("Could not load Heatmap: " + geojsonTargetDataSourceUrl);
                }
            });
        });
}

function onHeatmapDataLoaded(result) {
    heatmapGeojsonData = result;
    configureHeatmap();             // Configure heatmap
    // --- Enable / Disable corresponding features ---
    if (isTimestampAvailableInHeatmap()) {
        // Enable heatmap filter on time
        $('#feature-heatmap-time-filter').removeClass('d-none');
    } else {
        // Disable heatmap filter on time
        $('#feature-heatmap-time-filter').addClass('d-none');
    }
}

function configureHeatmap() {
    // --- Add data source ---
    map.addSource('latest-data', {
        type: 'geojson',
        data: heatmapGeojsonData
    });


    // --- Layer: Heatmap
    map.addLayer(
        {
            "id": "layer-heatmap",
            "type": "heatmap",
            "metadata": { "mapbox:group": "e686e2df54587f748da0baac43613eb5" },
            "source": "latest-data",
            "layout": {
            },
            "paint": {
                "heatmap-intensity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    5,
                    5,
                    1.3
                ],
                "heatmap-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    1,
                    1,
                    5,
                    4,
                    7,
                    5,
                    9,
                    6,
                    12,
                    11,
                    15,
                    25
                ],
                "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(0, 0, 255, 0)",
                    0.1,
                    "royalblue",
                    0.3,
                    "cyan",
                    0.5,
                    "lime",
                    0.7,
                    "yellow",
                    1,
                    "red"
                ],
                "heatmap-weight": [
                    "case",
                    [
                        "<",
                        ["get", "alt_in"],
                        0
                    ],
                    0,
                    [">", ["get", "vario"], 0],
                    1,
                    0
                ]
            }
        }

    );
    // End : Heatmap layer

    // --- Layer: Vario values
    map.addLayer(
        {
            "id": "layer-vario-value",
            "type": "symbol",
            "metadata": { "mapbox:group": "e686e2df54587f748da0baac43613eb5" },
            "source": "latest-data",
            "minzoom": 6,
            "filter": [">", ["get", "vario"], 1],
            "layout": {
                "text-justify": "auto",
                "text-size": 13,
                "text-offset": [0, 1],
                "text-field": [
                    "step",
                    ["zoom"],
                    "",
                    8,
                    ["to-string", ["get", "vario"]]
                ]
            },
            "paint": {}
        }
    );
    // End: Vario values

    filterBy(varioFilterValue, altInFilterValue);

    $('#slider, #slider-altitude-in').on('input',
        function (e) {
            var $varioSlider = $('#slider')[0];
            var $altitudeSlider = $('#slider-altitude-in')[0];

            varioFilterValue = parseFloat($varioSlider.value, 2);
            altInFilterValue = parseInt($altitudeSlider.value);
            filterBy(varioFilterValue, altInFilterValue);
        });
}