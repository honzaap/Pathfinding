import { fetchOverpassData } from "../api";
import { createGeoJSONCircle } from "../helpers";
import Graph from "../models/Graph";

/**
 * @typedef {Object} OSMNode
 * @property {String} type
 * @property {Number} id
 * @property {Number} lat
 * @property {Number} lon
 */

/**
 * Fetches data from OSM Overpass API and returns node nearest to specified coordinates
 * @param {Number} latitude 
 * @param {Number} longitude 
 * @returns {Promise<OSMNode>} 
 */
export async function getNearestNode(latitude, longitude) {
    const circle = createGeoJSONCircle([longitude, latitude], 0.15);
    const boundingBox = getBoundingBoxFromPolygon(circle);
    const response = await fetchOverpassData(boundingBox, false);
    const data = await response.json();

    let result;
    for(const node of data.elements) {
        if(node.type !== "node") continue;
        if(!result) {
            result = node;
            continue;
        }
        
        const newLength = Math.sqrt(Math.pow(node.lat - latitude, 2) + Math.pow(node.lon - longitude, 2));
        const resultLength = Math.sqrt(Math.pow(result.lat - latitude, 2) + Math.pow(result.lon - longitude, 2));

        if(newLength < resultLength) {
            result = node;
        }
    }

    return result;
}

/**
 * Fetches map data and converts them to graph structure
 * @param {Array} boundingBox array with 2 objects that have a latitude and longitude property 
 * @param {Number} startNodeId 
 * @returns 
 */
export async function getMapGraph(boundingBox, startNodeId) {
    const response = await fetchOverpassData(boundingBox, false);
    const data = await response.json();
    const elements = data.elements;
    
    const graph = new Graph();
    for(const element of elements) {
        if(element.type === "node") {
            const node = graph.addNode(element.id, element.lat, element.lon);
            
            if(node.id === startNodeId) {
                graph.startNode = node;
            }
        }
        else if(element.type === "way") {
            if(!element.nodes || element.nodes.length < 2) continue;

            for(let i = 0; i < element.nodes.length - 1; i++) {
                const node1 = graph.getNode(element.nodes[i]);
                const node2 = graph.getNode(element.nodes[i + 1]);

                if(!node1 || !node2) {
                    continue;
                }

                node1.connectTo(node2);
            }
        }
    }

    if(!graph.startNode) {
        throw new Error("Start node was not found.");
    }

    return graph;
}

/**
 * 
 * @param {Number[][]} polygon 
 * @returns {Array} array with 2 objects both containing latitude and longitude properties
 */
export function getBoundingBoxFromPolygon(polygon) {
    const boundingBox = { minLat: Number.MAX_VALUE, maxLat: -Number.MAX_VALUE, minLon: Number.MAX_VALUE, maxLon: -Number.MAX_VALUE };
    for(const coordinate of polygon) {
        if(coordinate[0] < boundingBox.minLon) boundingBox.minLon = coordinate[0];
        if(coordinate[0] > boundingBox.maxLon) boundingBox.maxLon = coordinate[0];
        if(coordinate[1] < boundingBox.minLat) boundingBox.minLat = coordinate[1];
        if(coordinate[1] > boundingBox.maxLat) boundingBox.maxLat = coordinate[1];
    }

    const formatted = [{ latitude: boundingBox.minLat, longitude: boundingBox.minLon }, { latitude: boundingBox.maxLat, longitude: boundingBox.maxLon }];
    return formatted;
}