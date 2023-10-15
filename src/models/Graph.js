import Node from "./Node";

export default class Graph {
    constructor() {
        this.startNode = null;
        this.endNode = null;
        this.nodes = [];
    }

    /**
     * 
     * @param {Number} id 
     * @returns node with given Id
     */
    getNode(id) {
        return this.nodes.find(n => n.id === id);
    }

    /**
     * 
     * @param {Number} id node id
     * @param {Number} latitude node latitude
     * @param {Number} longitude node longitude
     * @returns {Node} created node
     */
    addNode(id, latitude, longitude) {
        const node = new Node(id, latitude, longitude);
        this.nodes.push(node);
        return node;
    }
}