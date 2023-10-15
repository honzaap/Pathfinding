import Edge from "./Edge";

export default class Node {

    /**
     * 
     * @param {Number} id 
     * @param {Number} latitude 
     * @param {Number} longitude 
     */
    constructor(id, latitude, longitude) {
        this.edges = [];
        this.referer = null;
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.visited = false;
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
}