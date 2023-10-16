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
            this.openList = [];
            this.closedList = [];
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

    start() {
        this.openList = [this.startNode];
        this.startNode.g = 0;
        this.startNode.h = 0;
        console.log(this.startNode);
        console.log(this.endNode);
    }

    nextStep() {
        if(this.openList.length === 0) {
            console.log("open list is empty");
            return;
        }

        const currentNode = this.openList.reduce((acc, current) => current.f < acc.f ? current : acc, this.openList[0]);
        this.openList.splice(this.openList.indexOf(currentNode), 1); // TODO : possible optimization
        this.closedList.push(currentNode);

        // Found end node
        if(currentNode.id === this.endNode.id) {
            this.openList = [];
            console.log("FOUND END");
            return currentNode; // return neighbor;
        }

        for(const neighbor of currentNode.neighbors) {
            neighbor.referer = currentNode;
        }

        for(const neighbor of currentNode.neighbors) {
            if(this.closedList.includes(neighbor)) {
                continue;
            }

            // Update g and h value
            // if(neighbor.g === -1) 
            //     neighbor.g = Math.hypot(neighbor.longitude - this.startNode.longitude, neighbor.latitude - this.startNode.latitude);
            // if(neighbor.h === -1) 
            //     neighbor.h = Math.hypot(neighbor.longitude - this.endNode.longitude, neighbor.latitude - this.endNode.latitude);

            neighbor.g = currentNode.g + Math.hypot(neighbor.longitude - currentNode.longitude, neighbor.latitude - currentNode.latitude);
            neighbor.h = Math.hypot(neighbor.longitude - this.endNode.longitude, neighbor.latitude - this.endNode.latitude);

            if(this.openList.includes(neighbor)) {
                if(this.openList.find(n => n.g < neighbor.g)) {
                    continue;
                }
            }

            this.openList.push(neighbor);
        }

        return currentNode;
    }
}





// if(!this.currentNode) {
//     this.currentNode = this.startNode;
//     this.currentNode.visited = true;
//     this.currentNode.referer = this.currentNode;
//     return this.currentNode;
// }

// for(const edge of this.currentNode.edges) {
//     const node = edge.getOtherNode(this.currentNode);
//     if(!node.visited) {
//         node.visited = true;
//         node.referer = this.currentNode;
//         this.currentNode = node;
//         return this.currentNode;
//     }
// }