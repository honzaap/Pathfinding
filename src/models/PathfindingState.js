export default class PathfindingState {
    static #instance;

    /**
     * Singleton class
     * @returns PathfindingState
     */
    constructor() {
        if (!PathfindingState.#instance) {
            this.startNode = null;
            this.endNode = null;
            this.graph = null;
            PathfindingState.#instance = this;
        }
    
        return PathfindingState.#instance;
    }

    setGraph() {

        return null;
    }

    nextStep() {

        return null;
    }
}