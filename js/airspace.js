var isAirspaceLayerCreated = false;

var AIRSPACE_LAYER_DEFINITION =  {
    "id": "layer-airspace",
    "type": "line",
    "source": "airspace",
    "layout": {},
    "paint": {
        "line-color": [
            "match",
            ["get", "CLASS"],
            ["A"],
            "hsl(0, 72%, 44%)",
            ["C"],
            "hsl(36, 76%, 63%)",
            ["D"],
            "hsl(219, 59%, 32%)",
            ["E"],
            "hsl(105, 73%, 37%)",
            ["G"],
            "hsl(154, 79%, 58%)",
            ["CTR"],
            "hsl(281, 63%, 65%)",
            ["P"],
            "hsl(360, 89%, 32%)",
            ["R"],
            "hsl(0, 55%, 56%)",
            ["Q"],
            "hsl(0, 68%, 57%)",
            ["GP"],
            "hsl(16, 66%, 44%)",
            "hsl(0, 0%, 0%)"
        ]
    }
};

var INFRINGED_AIRSPACE_LAYER_DEFINITION =  {
    "id": "layer-infringed-airspace",
    "type": "fill",
    "source": "infringed-airspace",
    "layout": {},
    "paint": {
        "fill-color" : AIRSPACE_LAYER_DEFINITION.paint['line-color'],
        "fill-opacity": 0.25
    }
};

var AIRSPACE_LABEL_LAYER_DEFINITION =   {
    "id": "layer-airspace-label",
    "type": "symbol",
    "source": "airspace",
    "layout": {
        "text-field": [
            "to-string",
            [
                "concat",
                ["get", "CLASS"],
                "\n",
                ["get", "NAME"],
                "\n",
                ["get", "CEILING"],
                " / ",
                ["get", "FLOOR"]
            ]
        ],
        "text-size": 10,
        "text-justify": "auto"
    },
    "paint": {
        "text-color": "hsl(0, 8%, 33%)",
        "text-opacity": [
            "interpolate",
            ["exponential", 1],
            ["zoom"],
            0,
            0.14,
            5,
            1,
            22,
            1
        ]
    }
};

function setupAirspace() {
    var airspaceUrl = HeatmapRestAPIEndpoint + "/airspace/geojson";
    $.ajax({
        url: airspaceUrl,
        type: 'GET',
        context: document.body,
        dataType: "json",
        success: function(result) {
            if (typeof (result) !== 'object') {
                result = JSON.parse(result);
            }
            configureAirspace(result);    
        },
        error: function(result, status, errorThrown) {
            console.log(errorThrown);
            toastr["error"]("Could not load Airspace: " + airspaceUrl);
        }
    });
}


function configureAirspace(airspaceGeojson) {
    var check = checkIfMapboxStyleIsLoaded();
    if (!check) {
      // It's not safe to manipulate layers yet, so wait 200ms and then check again
      setTimeout(function() {
        configureAirspace(airspaceGeojson);
      }, 200);
      return;
    }
  
    // Whew, now it's safe to manipulate layers!
    map.addSource('airspace',
        {
            type: 'geojson',
            data: airspaceGeojson
        });
}

function createAirspaceLayer() {
    // --- Layer: Airspace
    map.addLayer(AIRSPACE_LAYER_DEFINITION);

    // -- Layer: Airspace label
    map.addLayer(AIRSPACE_LABEL_LAYER_DEFINITION);
    isAirspaceLayerCreated = true;
}

function showHideAirspace(visible) {
    var isLayerExist = map.getLayer("layer-airspace");

    // -- Show
    if (visible && !isAirspaceLayerCreated) {
        createAirspaceLayer();
    }
    else if (visible && isLayerExist) {
        map.setLayoutProperty("layer-airspace", 'visibility', 'visible');
        map.setLayoutProperty("layer-airspace-label", 'visibility', 'visible');
    }
    // --- Hide
    else if (!visible && isLayerExist) {
        map.setLayoutProperty("layer-airspace", 'visibility', 'none');
        map.setLayoutProperty("layer-airspace-label", 'visibility', 'none');
    }
}