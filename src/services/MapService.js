import { fetchOverpassData } from "../api";
import { createGeoJSONCircle } from "../helpers";

export async function getNearestNode(latitude, longitude) {
    const circle = createGeoJSONCircle([longitude, latitude], 0.15);
    const boundingBox = getBoundingBoxFromPolygon(circle);
    const formatted = [{ latitude: boundingBox.minLat, longitude: boundingBox.minLon }, { latitude: boundingBox.maxLat, longitude: boundingBox.maxLon }];
    console.log(formatted);
    const response = await fetchOverpassData(formatted, false);
    const data = await response.json();

    let result;
    console.log(data);
    for(const node of data.elements) {
        if(node.type !== "node") continue;
        if(!result) {
            result = node;
            continue;
        }

        console.log(node.lat);
        console.log(latitude);
        
        const newLength = Math.sqrt(Math.pow(node.lat - latitude, 2) + Math.pow(node.lon - longitude, 2));
        const resultLength = Math.sqrt(Math.pow(result.lat - latitude, 2) + Math.pow(result.lon - longitude, 2));

        if(newLength < resultLength) {
            console.log("?");
            result = node;
        }
    }

    return result;
}

export function getMapGraph() {
    // todo
}

export function getBoundingBoxFromPolygon(polygon) {
    const boundingBox = { minLat: Number.MAX_VALUE, maxLat: Number.MIN_VALUE, minLon: Number.MAX_VALUE, maxLon: Number.MIN_VALUE };
    for(const coord of polygon) {
        if(coord[0] < boundingBox.minLon) boundingBox.minLon = coord[0];
        if(coord[0] > boundingBox.maxLon) boundingBox.maxLon = coord[0];
        if(coord[1] < boundingBox.minLat) boundingBox.minLat = coord[1];
        if(coord[1] > boundingBox.maxLat) boundingBox.maxLat = coord[1];
    }

    return boundingBox;
}