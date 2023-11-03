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
    }

    start(startNode, endNode) {
        super.start(startNode, endNode);
        this.openSetStart = new Set();
        this.openSetEnd = new Set();
        this.openSetStart.add(startNode);
        this.openSetEnd.add(endNode);
        this.closedSetStart = new Set();
        this.closedSetEnd = new Set();
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
            const refEdge = currentStart.edges.find(e => e.getOtherNode(currentStart) === currentStart.referer);
            if(refEdge) refEdge.visited = true;

            // Intersected
            if (this.openSetEnd.has(currentStart)) {
                this.finished = true;
                console.log("found from start");
                return [currentStart];
            }
            updatedNodes.push(currentStart);
            updatedNodes.push(...this.updateNeighbors(currentStart, this.openSetStart, this.closedSetStart));
        }

        const currentEnd = this.getNextFromOpenSet(this.openSetEnd, this.closedSetEnd);
        if (currentEnd) {
            currentEnd.visited = true;
            this.closedSetEnd.add(currentEnd);
            const refEdge = currentEnd.edges.find(e => e.getOtherNode(currentEnd) === currentEnd.referer);
            if(refEdge) refEdge.visited = true;

            // Intersected
            if (this.openSetStart.has(currentEnd)) {
                console.log("found from end");
                this.finished = true;
                return [currentEnd];
            }
            updatedNodes.push(currentEnd);
            updatedNodes.push(...this.updateNeighbors(currentEnd, this.openSetEnd, this.closedSetEnd));
        }

        return updatedNodes;
    }

    updateNeighbors(node, openSet, closedSet) {
        const updatedNodes = [];

        for (const n of node.neighbors) {
            const neighbor = n.node;
            const edge = n.edge;

            // Fill edges that are not marked on the map
            if(neighbor.visited && !edge.visited) {
                edge.visited = true;
                neighbor.referer = node;
                updatedNodes.push(neighbor);
            }

            if (!closedSet.has(neighbor) && !neighbor.visited) {
                openSet.add(neighbor);
                neighbor.prevParent = neighbor.parent;
                neighbor.parent = node;
                neighbor.referer = node;
            }
        }

        return updatedNodes;
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