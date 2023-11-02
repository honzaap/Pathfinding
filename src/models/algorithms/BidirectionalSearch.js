import PathfindingAlgorithm from "./PathfindingAlgorithm";

class BidirectionalSearch extends PathfindingAlgorithm {
    constructor() {
        super();
        this.openSetStart = new Set();
        this.openSetEnd = new Set();
        this.openSetStart.add(this.startNode);
        this.openSetEnd.add(this.endNode);
        this.closedSetStart = new Set();
        this.closedSetEnd = new Set();
        this.intersectingNode = null;
    }

    start(startNode, endNode) {
        super.start(startNode, endNode);
        this.openSetStart = new Set();
        this.openSetEnd = new Set();
        this.openSetStart.add(startNode);
        this.openSetEnd.add(endNode);
        this.closedSetStart = new Set();
        this.closedSetEnd = new Set();
        this.intersectingNode = null;
    }

    nextStep() {
        if (this.finished) {
            return [];
        }

        const updatedNodes = [];

        const currentStart = this.getNextFromOpenSet(this.openSetStart, this.closedSetStart);
        if (currentStart) {
            currentStart.visited = true;
            this.closedSetStart.add(currentStart);
            // Intersected
            if (this.openSetEnd.has(currentStart)) {
                this.intersectingNode = currentStart;
                this.finished = true;
            }
            updatedNodes.push(currentStart);
            this.updateNeighbors(currentStart, this.openSetStart, this.closedSetStart);
        }

        const currentEnd = this.getNextFromOpenSet(this.openSetEnd, this.closedSetEnd);
        if (currentEnd) {
            currentEnd.visited = true;
            this.closedSetEnd.add(currentEnd);
            // Intersected
            if (this.openSetStart.has(currentEnd)) {
                this.intersectingNode = currentEnd;
                this.finished = true;
            }
            updatedNodes.push(currentEnd);
            this.updateNeighbors(currentEnd, this.openSetEnd, this.closedSetEnd);
        }

        return updatedNodes;
    }

    updateNeighbors(node, openSet, closedSet) {
        for (const n of node.neighbors) {
            const neighbor = n.node;

            if (!closedSet.has(neighbor) && !neighbor.visited) {
                openSet.add(neighbor);
                neighbor.parent = node;
                neighbor.referer = node;
            }
        }
    }

    getNextFromOpenSet(openSet, closedSet) {
        let minNode = null;

        for (const node of openSet) {
            if (!minNode || node.totalDistance < minNode.totalDistance) {
                if (!closedSet.has(node)) {
                    minNode = node;
                }
            }
        }

        if (minNode) {
            openSet.delete(minNode);
        }

        return minNode;
    }
}

export default BidirectionalSearch;