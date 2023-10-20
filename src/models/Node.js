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
        this.reset();
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.visited = false;

    }

    get f() {
        return this.g + this.h;
    }

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

    reset() {
        this.visited = false;
        this.g = 0; // TODO : better name
        this.h = 0; // TODO : better name
        this.parent = null;
        this.referer = null;

        for(const neighbor of this.neighbors) {
            neighbor.edge.visited = false;
        }
    }
}