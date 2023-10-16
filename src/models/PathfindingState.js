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
            return;
        }

        const currentNode = this.openList.reduce((acc, current) => current.f < acc.f ? current : acc, this.openList[0]);
        this.openList.splice(this.openList.indexOf(currentNode), 1); // TODO : possible optimization
        this.closedList.push(currentNode);

        // Found end node
        if(currentNode.id === this.endNode.id) {
            this.openList = [];
            return currentNode;
        }

        for(const neighbor of currentNode.neighbors) {
            neighbor.h = Math.hypot(neighbor.longitude - this.endNode.longitude, neighbor.latitude - this.endNode.latitude); // TODO : uncesessary?
            const neighborCurrentCost = currentNode.g + Math.hypot(neighbor.longitude - currentNode.longitude, neighbor.latitude - currentNode.latitude);

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
                //neighbor.h = Math.hypot(neighbor.longitude - this.endNode.longitude, neighbor.latitude - this.endNode.latitude);
            }
            neighbor.g = neighborCurrentCost;
            neighbor.referer = currentNode;
        }
        this.closedList.push(currentNode);

        return currentNode;
    }
}