import PathfindingAlgorithm from "./PathfindingAlgorithm";

class Dijkstra extends PathfindingAlgorithm {
    constructor() {
        super();
        this.openList = [];
    }

    start(startNode, endNode) {
        super.start(startNode, endNode);
        this.openList = [startNode];
    }

    nextStep() {
        if (this.openList.length === 0) {
            this.finished = true;
            return [];
        }

        const updatedNodes = [];
        const currentNode = this.openList.shift();
        currentNode.visited = true;
        const refEdge = currentNode.edges.find(e => e.getOtherNode(currentNode) === currentNode.referer);
        if(refEdge) refEdge.visited = true;

        // Found end node
        if (currentNode.id === this.endNode.id) {
            this.openList = [];
            this.finished = true;
            return [currentNode];
        }

        for (const n of currentNode.neighbors) {
            const neighbor = n.node;
            const edge = n.edge;

            // Fill edges that are not marked on the map
            if(neighbor.visited && !edge.visited) {
                edge.visited = true;
                neighbor.referer = currentNode;
                updatedNodes.push(neighbor);
            }

            if (neighbor.visited) continue;

            const neighborCurrentCost = currentNode.distanceFromStart + edge.weight;

            if (this.openList.includes(neighbor)) {
                if (neighborCurrentCost >= neighbor.distanceFromStart) {
                    continue;
                }
            } 
            else {
                this.openList.push(neighbor);
            }

            neighbor.distanceFromStart = neighborCurrentCost;
            neighbor.parent = currentNode;
            neighbor.referer = currentNode;
        }

        return [...updatedNodes, currentNode];
    }
}

export default Dijkstra;