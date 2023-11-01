import PathfindingAlgorithm from "./PathfindingAlgorithm";

class Greedy extends PathfindingAlgorithm {
    constructor() {
        super();
        this.openList = [];
    }    
    
    start(startNode, endNode) {
        super.start(startNode, endNode);
        this.openList = [this.startNode];
        this.startNode.distanceFromStart = 0;
        this.startNode.distanceToEnd = 0;
    }

    nextStep() {
        if(this.openList.length === 0) {
            this.finished = true;
            return [];
        }

        const updatedNodes = [];
        const currentNode = this.openList.reduce((acc, current) => current.distanceToEnd < acc.distanceToEnd ? current : acc, this.openList[0]);
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

            // Fill edges that are not marked on the map
            if(neighbor.visited && !edge.visited) {
                edge.visited = true;
                neighbor.referer = currentNode;
                updatedNodes.push(neighbor);
            }

            if(neighbor.visited) continue;

            neighbor.distanceToEnd = Math.hypot(neighbor.longitude - this.endNode.longitude, neighbor.latitude - this.endNode.latitude);
            if(!this.openList.includes(neighbor)) this.openList.push(neighbor);

            neighbor.referer = currentNode;
            neighbor.parent = currentNode;
        }

        return [...updatedNodes, currentNode];
    }
}

export default Greedy;