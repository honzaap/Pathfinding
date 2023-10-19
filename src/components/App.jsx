import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { createGeoJSONCircle } from "../helpers";
import { useEffect, useRef, useState } from "react";
import { getBoundingBoxFromPolygon, getMapGraph, getNearestNode } from "../services/MapService";
import PathfindingState from "../models/PathfindingState";

const MAPBOX_ACCESS_TOKEN = "sk.eyJ1IjoiaG9uemFhcCIsImEiOiJjbG5vdXRtNm8wamNuMnJxaTl5d2dwaWZpIn0.nRWrLVhRxw7hZpE67i4Xuw";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const INITIAL_VIEW_STATE = {
    longitude: 15.058855041919362,
    latitude: 50.769436485473946,
    zoom: 13,
    pitch: 0,
    bearing: 0
};

function App() {
    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [selectionRadius, setSelectionRadius] = useState([]);
    const [tripsData, setTripsData] = useState([]);
    const [started, setStarted] = useState();
    const [time, setTime] = useState(0);
    const [animationEnded, setAnimationEnded] = useState(false);
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const timer = useRef(0);
    const waypoints = useRef([]);
    const state = useRef(new PathfindingState());
    const traceNode = useRef(null);

    async function mapClick(e, info) {
        // TODO : refactor
        let cleared = false;
        if(started && !animationEnded) return;
        if(state.current.graph) {
            clearPath();
            cleared = true;
        }
        if(info.rightButton) {
            if(e.layer?.id !== "selection-radius") {
                console.log("You need to pick a point in the highlighted radius"); // TODO
                return;
            }
            const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
            setEndNode(node);
            
            const realEndNode = state.current.getNode(node.id);
            if(!realEndNode) {
                throw new Error("Somehow the end node isn't in bounds");
            }

            state.current.endNode = realEndNode;

            return;
        }

        const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
        setStartNode(node);
        setEndNode(null);
        const circle = createGeoJSONCircle([node.lon, node.lat], 2);
        setSelectionRadius([{ contour: circle}]);
        
        const graph = await getMapGraph(getBoundingBoxFromPolygon(circle), node.id);
        state.current.graph = graph;
        if(!cleared) clearPath();
    }

    function startPathfinding() {
        clearPath();
        state.current.start();
        setStarted(true);
    }

    function togglePathfinding() {
        setStarted(!started);
        if(started) {
            previousTimeRef.current = null;
        }
    }

    function clearPath() {
        setStarted(false);
        setAnimationEnded(false);
        setTripsData([]);
        setTime(0);
        state.current.reset();
        waypoints.current = [];
        timer.current = 0;
        previousTimeRef.current = null;
        traceNode.current = null;
    }

    function animate(newTime) {
        const updatedNodes = state.current.nextStep();
        for(const updatedNode of updatedNodes) {
            if(!updatedNode.referer) continue;

            const referNode = updatedNode.referer;
            const distance = Math.hypot(updatedNode.longitude - referNode.longitude, updatedNode.latitude - referNode.latitude);
            const time = distance * 50000;

            waypoints.current = [...waypoints.current,
                { waypoints: [
                    { coordinates: [referNode.longitude, referNode.latitude], timestamp: timer.current },
                    { coordinates: [updatedNode.longitude, updatedNode.latitude], timestamp: timer.current + time },
                ]}
            ];

            timer.current += time;
            setTripsData(() => waypoints.current);
        }

        if(state.current.finished) {
            if(!traceNode.current) traceNode.current = state.current.endNode;
            const parentNode = traceNode.current.parent;
            if(parentNode) { // TODO : refactor
                const distance = Math.hypot(traceNode.current.longitude - parentNode.longitude, traceNode.current.latitude - parentNode.latitude);
                const time = distance * 50000;
    
                waypoints.current = [...waypoints.current,
                    { waypoints: [
                        { coordinates: [traceNode.current.longitude, traceNode.current.latitude], timestamp: timer.current },
                        { coordinates: [parentNode.longitude, parentNode.latitude], timestamp: timer.current + time },
                    ], color: [160, 100, 250]}
                ];
    
                timer.current += time;
                setTripsData(() => waypoints.current);
                traceNode.current = parentNode;
            }
            setAnimationEnded(time >= timer.current);
        }
        if (previousTimeRef.current != null && !animationEnded) {
            const deltaTime = newTime - previousTimeRef.current;
            setTime(prevTime => (prevTime + deltaTime));
        }

        previousTimeRef.current = newTime;
        requestRef.current = requestAnimationFrame(animate);
    }

    useEffect(() => {
        if(!started) return;
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [started, time, animationEnded]);

    return (
        <>
            <div onContextMenu={(e) => {e.preventDefault();}}>
                <DeckGL
                    initialViewState={INITIAL_VIEW_STATE}
                    controller={{ doubleClickZoom: false }}
                    onClick={mapClick}
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
                        data={[
                            ...(startNode ? [{ coordinates: [startNode.lon, startNode.lat], color: [255, 140, 0] }] : []),
                            ...(endNode ? [{ coordinates: [endNode.lon, endNode.lat], color: [255, 0, 0] }] : []),
                        ]}
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
                    <TripsLayer
                        id={"pathfinding-layer"}
                        data={tripsData}
                        getPath={d => d.waypoints.map(p => p.coordinates)}
                        getTimestamps={d => d.waypoints.map(p => p.timestamp)}
                        getColor={d => d.color ?? [253, 128, 93]}
                        opacity={1}
                        widthMinPixels={3}
                        widthMaxPixels={5}
                        fadeTrail={false}
                        trailLength={6000}
                        currentTime={time}
                    />
                    <Map 
                        mapboxAccessToken={MAPBOX_ACCESS_TOKEN} 
                        reuseMaps mapLib={maplibregl} 
                        mapStyle={MAP_STYLE} 
                        doubleClickZoom={false}
                    />
                </DeckGL>
            </div>
            <div className="test-buttons">
                <button disabled={!startNode || !endNode} onClick={startPathfinding}>{time}</button>
                <button disabled={!animationEnded && started} onClick={clearPath}>clear</button>
                <button disabled={time === 0 || animationEnded} onClick={togglePathfinding}>
                    {(started || time === 0) && <span>stop</span>}
                    {(!started && time > 0) && <span>resume</span>}
                </button>
            </div>
        </>
    );
}

export default App;