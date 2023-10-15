import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { createGeoJSONCircle } from "../helpers";
import { useMemo, useState } from "react";
import { getBoundingBoxFromPolygon, getMapGraph, getNearestNode } from "../services/MapService";
import PathfindingState from "../models/PathfindingState";
import GraphDebug from "./GraphDebug";

const MAPBOX_ACCESS_TOKEN = "sk.eyJ1IjoiaG9uemFhcCIsImEiOiJjbG5vdXRtNm8wamNuMnJxaTl5d2dwaWZpIn0.nRWrLVhRxw7hZpE67i4Xuw";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const INITIAL_VIEW_STATE = {
    longitude: 15.058855041919362,
    latitude: 50.769436485473946,
    zoom: 13,
    pitch: 0,
    bearing: 0
};
const state = new PathfindingState();

function App() {
    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [selectionRadius, setSelectionRadius] = useState([]);
    const scatterLayer = useMemo(() => {
        const result = [];
        if(startNode) result.push({ coordinates: [startNode.lon, startNode.lat], color: [255, 140, 0] });
        if(endNode) result.push({ coordinates: [endNode.lon, endNode.lat], color: [255, 0, 0] });
        return result;
    }, [startNode, endNode]);

    async function onClick(e, info) {
        if(info.rightButton) {
            if(e.layer?.id !== "selection-radius") {
                console.log("You need to pick a point in the highlighted radius"); // TODO
                return;
            }

            setEndNode(await getNearestNode(e.coordinate[1], e.coordinate[0]));
            return;
        }

        const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
        setStartNode(node);
        setEndNode(null);
        const circle = createGeoJSONCircle([node.lon, node.lat], 2);
        setSelectionRadius([{ contour: circle}]);

        const graph = await getMapGraph(getBoundingBoxFromPolygon(circle), node.id);
        state.graph = graph;
    }

    function testClick() {
        setStartNode(null);
        setSelectionRadius(null);
        setEndNode(null);
        animate();
    }

    function animate() {
        const updatedNode = state.nextStep();
        if(!updatedNode) return;

        // TODO: Somehow project changes to deckgl layer 

        requestAnimationFrame(animate);
    }

    return (
        <>
            <div onContextMenu={(e) => {e.preventDefault();}}>
                <DeckGL
                    initialViewState={INITIAL_VIEW_STATE}
                    controller={{ doubleClickZoom: false }}
                    onClick={onClick}
                >
                    <PolygonLayer 
                        id={"selection-radius"}
                        data={selectionRadius}
                        pickable={true}
                        stroked={false}
                        getPolygon={d => d.contour}
                        getFillColor={[240, 112, 145]}
                        opacity={0.03}
                    />
                    <ScatterplotLayer 
                        id="start-end-points"
                        data={scatterLayer}
                        pickable={true}
                        opacity={0.8}
                        stroked={true}
                        filled={true}
                        radiusScale={1}
                        radiusMinPixels={7}
                        radiusMaxPixels={20}
                        lineWidthMinPixels={1}
                        lineWidthMaxPixels={3}
                        getPosition={d => d.coordinates}
                        getFillColor={d => d.color}
                        getLineColor={[0, 0, 0]}
                    />
                    <Map 
                        mapboxAccessToken={MAPBOX_ACCESS_TOKEN} 
                        reuseMaps mapLib={maplibregl} 
                        mapStyle={MAP_STYLE} 
                        doubleClickZoom={false}
                    />
                </DeckGL>
            </div>
            <button className="test-btn" onClick={testClick}>X</button>
            {startNode && <GraphDebug graph={state.graph}></GraphDebug>}
        </>
    );
}

export default App;