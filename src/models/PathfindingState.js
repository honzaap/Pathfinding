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
            this.openList = [];
            this.closedList = [];
            this.finished = false;
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

    reset() {
        this.openList = [];
        this.closedList = [];
        this.finished = false;
        if(!this.graph) return;
        for(const node of this.graph.nodes) {
            node.reset();
        }
    }

    start() {
        this.reset();
        this.openList = [this.startNode];
        this.startNode.g = 0;
        this.startNode.h = 0;
    }

    nextStep() {
        if(this.openList.length === 0) {
            this.finished = true;
            return [];
        }

        const updatedNodes = [];
        const currentNode = this.openList.reduce((acc, current) => current.f < acc.f ? current : acc, this.openList[0]);
        const time = performance.now();
        this.openList.splice(this.openList.indexOf(currentNode), 1);
        console.log(performance.now() - time);
        currentNode.visited = true;
        const refEdge = currentNode.edges.find(e => e.getOtherNode(currentNode) === currentNode.referer);
        if(refEdge) refEdge.visited = true;

        // Found end node
        if(currentNode.id === this.endNode.id) {
            this.openList = [];
            this.finished = true;
            return [currentNode];
        }

        for(const n of currentNode.neighbors) {
            const neighbor = n.node;
            const edge = n.edge;
            const neighborCurrentCost = currentNode.g + Math.hypot(neighbor.longitude - currentNode.longitude, neighbor.latitude - currentNode.latitude);

            // Fill edges that are not marked on the map
            if(neighbor.visited && !edge.visited) {
                edge.visited = true;
                neighbor.referer = currentNode;
                updatedNodes.push(neighbor);
            }

            if(this.openList.includes(neighbor)) {
                if(neighbor.g <= neighborCurrentCost) continue;
            }
            else if(this.closedList.includes(neighbor)) {
                if(neighbor.g <= neighborCurrentCost) continue;
                this.closedList.splice(this.closedList.indexOf(neighbor), 1);
                this.openList.push(neighbor);
            }
            else {
                this.openList.push(neighbor);
                neighbor.h = Math.hypot(neighbor.longitude - this.endNode.longitude, neighbor.latitude - this.endNode.latitude);
            }

            neighbor.g = neighborCurrentCost;
            neighbor.referer = currentNode;
            neighbor.parent = currentNode;
        }

        this.closedList.push(currentNode);

        return [...updatedNodes, currentNode];
    }
}