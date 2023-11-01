/**
 * 
 * @param {Number[]} center array with longitude and latitude coordinates of the center point
 * @param {Number} radiusInKm radius
 * @param {Number} points how many will the resulting polygon have
 * @returns {Number[][]} 2D array with latitude and longitude coordinates for each point
 */
export function createGeoJSONCircle(center, radiusInKm, points = 64) {
    const coords = {
        latitude: center[1],
        longitude: center[0]
    };

    const km = radiusInKm;

    const ret = [];
    const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
    const distanceY = km / 110.574;

    let theta, x, y;
    for(var i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI);
        x = distanceX * Math.cos(theta);
        y = distanceY * Math.sin(theta);

        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return ret;
}

/**
 * 
 * @param {String} color string in rgba style
 * @returns {Number[]} array of rgba color values from 0 to 255
 */
export function rgbToArray(color) {
    const result = color.match(/\d+(\.\d)?/g).map(Number);
    if(result[3]) result[3] *= 255;
    return result;
}

/**
 * 
 * @param {Number[]} array array of rgba color values from 0 to 255
 * @returns {String} string in rgba style
 */
export function arrayToRgb(array) {
    if(!array) return "rgb(0, 0, 0)";
    const rgb = [...array];
    if(rgb[3]) rgb[3] /= 255;
    const result = `rgb${array.length >= 4 ? "a" : ""}(${rgb.join(", ")})`;
    return result;
}