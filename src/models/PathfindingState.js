export default class PathfindingState {
    static #instance;

    /**
     * Singleton class
     * @returns {PathfindingState}
     */
    constructor() {
        if (!PathfindingState.#instance) {
            this.endNode = null;
            this.graph = null;
            this.currentNode = null;
            PathfindingState.#instance = this;
        }
    
        return PathfindingState.#instance;
    }

    get startNode() {
        return this.graph.startNode;
    }

    getNode(id) {
        return this.graph?.getNode(id);
    }

    nextStep() {
        if(!this.currentNode) {
            this.currentNode = this.startNode;
            this.currentNode.visited = true;
            this.currentNode.referer = this.currentNode;
            return this.currentNode;
        }

        for(const edge of this.currentNode.edges) {
            const node = edge.getOtherNode(this.currentNode);
            if(!node.visited) {
                node.visited = true;
                node.referer = this.currentNode;
                this.currentNode = node;
                return this.currentNode;
            }
        }

        return null;
    }
}