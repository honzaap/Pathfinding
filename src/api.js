/**
 * 
 * @param {Array} array with 2 objects that have a latitude and longitude property 
 * @returns {Promise<Response>}
 */
export function fetchOverpassData(boundingBox) {
    const query = `
    [out:json];(
        way[highway][highway!="footway"][highway!="street_lamp"][footway!="*"]
        (${boundingBox[0].latitude},${boundingBox[0].longitude},${boundingBox[1].latitude},${boundingBox[1].longitude});
        node(w);
    );
    out skel;`;

    return fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
    });
}