import Edge from "./Edge";

/**
 * @typedef {Object} NodeNeighbor
 * @property {Node} node
 * @property {Edge} edge
 */

export default class Node {

    /**
     * 
     * @param {Number} id 
     * @param {Number} latitude 
     * @param {Number} longitude 
     */
    constructor(id, latitude, longitude) {
        this.edges = [];
        this.reset();
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.visited = false;
    }

    /**
     * @returns {Number} f heuristics
     */
    get totalDistance() {
        return this.distanceFromStart + this.distanceToEnd;
    }

    /**
     * @returns {NodeNeighbor[]} list of neighbors 
     */
    get neighbors() {
        return this.edges.map(edge => ({ edge, node: edge.getOtherNode(this)}));
    }

    /**
     * 
     * @param {Node} node 
     */
    connectTo(node) {
        const edge = new Edge(this, node);
        this.edges.push(edge);
        node.edges.push(edge);
    }

    /**
     * Reset node to default state
     */
    reset() {
        this.visited = false;
        this.distanceFromStart = 0;
        this.distanceToEnd = 0;
        this.parent = null;
        this.referer = null;

        for(const neighbor of this.neighbors) {
            neighbor.edge.visited = false;
        }
    }
}