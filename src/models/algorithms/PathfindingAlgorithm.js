class PathfindingAlgorithm {
    constructor() {
        this.finished = false;
    }

    /**
     * Reset internal state and initialize new pathfinding
     * @param {(import("./Node").default)} startNode 
     * @param {(import("./Node").default)} endNode 
     */
    start(startNode, endNode) {
        this.finished = false;
        this.startNode = startNode;
        this.endNode = endNode;
    }

    /**
     * Progresses the pathfinding algorithm by one step/iteration
     * @returns {(import("./Node").default)[]} array of nodes that were updated
     */
    nextStep() {
        return [];
    }
}

export default PathfindingAlgorithm;