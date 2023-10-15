import { fetchOverpassData } from "../api";
import { createGeoJSONCircle } from "../helpers";
import Node from "../models/Node";

/**
 * 
 * @param {Number} latitude 
 * @param {Number} longitude 
 * @returns OSM API object with type node
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
    console.log(result);
    return result;
}

export async function getMapGraph(boundingBox, startNodeId, endNodeId) {
    const response = await fetchOverpassData(boundingBox, false);
    const data = await response.json();
    const elements = data.elements;
    
    const nodes = [];
    let startNode;
    let endNode;
    for(const element of elements) {
        if(element.type === "node") {
            const node = new Node(element.id, element.lat, element.lon);
            nodes.push(node);
            
            if(node.id === startNodeId) {
                startNode = node;
            }
            else if(node.id === endNodeId) {
                endNode = node;
            }
        }
        else if(element.type === "way") {
            if(!element.nodes || element.nodes.length < 2) continue;

            for(let i = 0; i < element.nodes.length - 1; i++) {
                const node1 = nodes.find(n => n.id === element.nodes[i]);
                const node2 = nodes.find(n => n.id === element.nodes[i + 1]);

                if(!node1 || !node2) {
                    throw new Error("Node in a way was not found.");
                }

                node1.connectTo(node2);
            }
        }
    }

    if(!startNode || !endNode) {
        throw new Error(`Start node or end node were not found. Start: ${startNode}, End: ${endNode}`);
    }
}

/**
 * 
 * @param {Number[][]} polygon 
 * @returns {Array} array with 2 objects both containing latitude and longitude properties
 */
export function getBoundingBoxFromPolygon(polygon) {
    const boundingBox = { minLat: Number.MAX_VALUE, maxLat: Number.MIN_VALUE, minLon: Number.MAX_VALUE, maxLon: Number.MIN_VALUE };
    for(const coordinate of polygon) {
        if(coordinate[0] < boundingBox.minLon) boundingBox.minLon = coordinate[0];
        if(coordinate[0] > boundingBox.maxLon) boundingBox.maxLon = coordinate[0];
        if(coordinate[1] < boundingBox.minLat) boundingBox.minLat = coordinate[1];
        if(coordinate[1] > boundingBox.maxLat) boundingBox.maxLat = coordinate[1];
    }

    const formatted = [{ latitude: boundingBox.minLat, longitude: boundingBox.minLon }, { latitude: boundingBox.maxLat, longitude: boundingBox.maxLon }];
    return formatted;
}