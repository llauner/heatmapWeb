const HeatmapRestAPIEndpoint = "https://igcheatmap.appspot.com";
const storageBaseUrl = "geojson/";
const heatMapFileNamePrefix = "-heatmap.geojson";
const metaDataFileNamePrefix = "-metadata.json";

const TargetDateFormat = "YYYY_MM_DD"

// --- Airspace
const NetcoupeAirspaceDataUrl = "/airspacedata/";
const OpenAirGeojsonFileName = "netcoupe-france.geojson";
const OpenAirMetadataFileName = "netcoupe-france-metadata.json";

// --- IgcRest API
const IgcRestApiEndpoint = "https://igcrestapi-dot-igcheatmap.appspot.com";
const IgcRestApiProcessedHeatmapDaysUrl = "/heatmap/days";


class DayFilenames {
	constructor(geojsonFileName, metaDataFileName) {
		this.GeojsonFileName = geojsonFileName;
		this.MetaDataFileName = metaDataFileName;
	}

};
/**
 * getFilenamesForTargetDate
 * Builds the filenames for a given target date
 * @param {*} target_date
 */
function getFilenamesForTargetDate(target_date) {
	f = new DayFilenames(
		`${storageBaseUrl}${target_date}-heatmap.geojson`,
		`${storageBaseUrl}${target_date}-metadata.json`)

	return f;
}