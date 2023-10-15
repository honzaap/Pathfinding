import { useRef } from "react";
import PathfindingState from "../models/PathfindingState";

/**
 * Prints a rough representation of the graph in the PathfindingState
 */
function GraphDebug() {
    const canvasRef = useRef();
    const state = new PathfindingState();

    setTimeout(() => {
        drawGraph();
    }, 3500);

    function drawGraph() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillRect(0, 0, 1920, 1000);

        const bb = { minLat: Number.MAX_VALUE, maxLat: -Number.MAX_VALUE, minLon: Number.MAX_VALUE, maxLon: -Number.MAX_VALUE };

        for(const node of state.graph.nodes) {
            if(node.latitude < bb.minLat) bb.minLat = node.latitude;
            if(node.latitude > bb.maxLat) bb.maxLat = node.latitude;
            if(node.longitude < bb.minLon) bb.minLon = node.longitude;
            if(node.longitude > bb.maxLon) bb.maxLon = node.longitude;
        }
        
        const lonD = bb.maxLon - bb.minLon;
        const latD = bb.maxLat - bb.minLat;
        
        const lonMul = 1 / (window.innerWidth / lonD);
        const latMul = 1 / (window.innerHeight / latD);

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 0.1;
        for(const node of state.graph.nodes) {
            for(const edge of node.edges) {
                const otherNode = edge.getOtherNode(node);
                const x1 = (node.longitude - bb.minLon) / lonMul;
                const y1 = window.innerHeight - (node.latitude - bb.minLat) / latMul;
                const x2 = (otherNode.longitude - bb.minLon) / lonMul;
                const y2 = window.innerHeight - (otherNode.latitude - bb.minLat) / latMul;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }

        ctx.strokeStyle = "#fff";
        for(const node of state.graph.nodes) {
            const x = (node.longitude - bb.minLon) / lonMul;
            const y = window.innerHeight - (node.latitude - bb.minLat) / latMul;
            ctx.beginPath();
            ctx.arc(x, y, 0.65, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    }

    return (
        <>
            <canvas width="1920" height="1000" ref={canvasRef} className="graph-debug"></canvas>
        </>
    );
}

export default GraphDebug;