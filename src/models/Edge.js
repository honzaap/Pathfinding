export default class Edge {

    /**
     * 
     * @param {import("./Node").default} node1 
     * @param {import("./Node").default} node2 
     */
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
        this.visited = false;
    }

    /**
     * 
     * @param {import("./Node").default} node 
     * @returns {import("./Node").default} the other node
     */
    getOtherNode(node) {
        return node === this.node1 ? this.node2 : this.node1;
    }

    /**
     * 
     * @returns weight of the edge
     */
    get weight() {
        return Math.hypot(this.node1.latitude - this.node2.latitude, this.node1.longitude - this.node2.longitude);
    }
}