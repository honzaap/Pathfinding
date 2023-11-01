import PathfindingAlgorithm from "./PathfindingAlgorithm";

class AStar extends PathfindingAlgorithm {
    constructor() {
        super();
        this.openList = [];
        this.closedList = [];
    }

    start(startNode, endNode) {
        super.start(startNode, endNode);
        this.openList = [this.startNode];
        this.closedList = [];
        this.startNode.distanceFromStart = 0;
        this.startNode.distanceToEnd = 0;
    }

    nextStep() {
        if(this.openList.length === 0) {
            this.finished = true;
            return [];
        }

        const updatedNodes = [];
        const currentNode = this.openList.reduce((acc, current) => current.totalDistance < acc.totalDistance ? current : acc, this.openList[0]);
        this.openList.splice(this.openList.indexOf(currentNode), 1);
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
            const neighborCurrentCost = currentNode.distanceFromStart + Math.hypot(neighbor.longitude - currentNode.longitude, neighbor.latitude - currentNode.latitude);

            // Fill edges that are not marked on the map
            if(neighbor.visited && !edge.visited) {
                edge.visited = true;
                neighbor.referer = currentNode;
                updatedNodes.push(neighbor);
            }

            if(this.openList.includes(neighbor)) {
                if(neighbor.distanceFromStart <= neighborCurrentCost) continue;
            }
            else if(this.closedList.includes(neighbor)) {
                if(neighbor.distanceFromStart <= neighborCurrentCost) continue;
                this.closedList.splice(this.closedList.indexOf(neighbor), 1);
                this.openList.push(neighbor);
            }
            else {
                this.openList.push(neighbor);
                neighbor.distanceToEnd = Math.hypot(neighbor.longitude - this.endNode.longitude, neighbor.latitude - this.endNode.latitude);
            }

            neighbor.distanceFromStart = neighborCurrentCost;
            neighbor.referer = currentNode;
            neighbor.parent = currentNode;
        }

        this.closedList.push(currentNode);

        return [...updatedNodes, currentNode];
    }
}

export default AStar;