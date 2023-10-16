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
        this.g = 0;
        this.h = 0;
    }

    get f() {
        return this.g + this.h;
    }

    get neighbors() {
        return this.edges.map(e => e.getOtherNode(this));
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