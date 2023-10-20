import Node from "./Node";

export default class Graph {
    constructor() {
        this.startNode = null;
        this.nodes = new Map();
    }

    /**
     * 
     * @param {Number} id 
     * @returns node with given Id
     */
    getNode(id) {
        return this.nodes.get(id);
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
        this.nodes.set(node.id, node);
        return node;
    }
}