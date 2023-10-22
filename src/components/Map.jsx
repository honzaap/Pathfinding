import DeckGL from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { createGeoJSONCircle } from "../helpers";
import { useEffect, useRef, useState } from "react";
import { getBoundingBoxFromPolygon, getMapGraph, getNearestNode } from "../services/MapService";
import PathfindingState from "../models/PathfindingState";
import Interface from "./Interface";
import { INITIAL_VIEW_STATE, MAPBOX_ACCESS_TOKEN, MAP_STYLE } from "../config";
import useSmoothStateChange from "../hooks/useSmoothStateChange";

function Map() {
    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [selectionRadius, setSelectionRadius] = useState([]);
    const [tripsData, setTripsData] = useState([]);
    const [started, setStarted] = useState();
    const [time, setTime] = useState(0);
    const [animationEnded, setAnimationEnded] = useState(false);
    const fadeRadius = useRef();
    const fadeRadiusReverse = useRef(false);
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const timer = useRef(0);
    const waypoints = useRef([]);
    const state = useRef(new PathfindingState());
    const traceNode = useRef(null);
    const selectionRadiusOpacity = useSmoothStateChange(0, 0, 1, 400, fadeRadius.current, fadeRadiusReverse.current);

    async function mapClick(e, info) {
        if(started && !animationEnded) return;
        fadeRadiusReverse.current = false;
        fadeRadius.current = true;
        clearPath();
        if(info.rightButton) {
            if(e.layer?.id !== "selection-radius") {
                console.log("You need to pick a point in the highlighted radius"); // TODO
                return;
            }
            
            const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
            const realEndNode = state.current.getNode(node.id);
            setEndNode(node);
            
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
        
        getMapGraph(getBoundingBoxFromPolygon(circle), node.id).then(graph => {
            state.current.graph = graph;
            clearPath();
        });
    }

    function startPathfinding() {
        fadeRadiusReverse.current = true;
        setTimeout(() => {
            clearPath();
            state.current.start();
            setStarted(true);
        }, 400);
    }

    function toggleAnimation() {
        setStarted(!started);
        if(started) {
            previousTimeRef.current = null;
        }
    }

    function clearPath() {
        setStarted(false);
        setTripsData([]);
        setTime(0);
        state.current.reset();
        waypoints.current = [];
        timer.current = 0;
        previousTimeRef.current = null;
        traceNode.current = null;
        setAnimationEnded(false);
    }

    function animate(newTime) {
        for(const updatedNode of state.current.nextStep()) {
            updateWaypoints(updatedNode, updatedNode.referer);
        }

        if(state.current.finished && !animationEnded) {
            if(!traceNode.current) traceNode.current = state.current.endNode;
            const parentNode = traceNode.current.parent;
            updateWaypoints(parentNode, traceNode.current, [160, 100, 250]);
            traceNode.current = parentNode ?? traceNode.current;
            setAnimationEnded(time >= timer.current && parentNode == null);
        }

        if (previousTimeRef.current != null && !animationEnded) {
            const deltaTime = newTime - previousTimeRef.current;
            setTime(prevTime => (prevTime + deltaTime));
        }

        previousTimeRef.current = newTime;
        requestRef.current = requestAnimationFrame(animate);
    }

    function updateWaypoints(node, refererNode, color = undefined) {
        if(!node || !refererNode) return;
        const distance = Math.hypot(node.longitude - refererNode.longitude, node.latitude - refererNode.latitude);
        const timeAdd = distance * 50000; // todo : speed variable

        waypoints.current = [...waypoints.current,
            { waypoints: [
                { coordinates: [refererNode.longitude, refererNode.latitude], timestamp: timer.current },
                { coordinates: [node.longitude, node.latitude], timestamp: timer.current + timeAdd },
            ], color, timestamp: timer.current + timeAdd}
        ];

        timer.current += timeAdd;
        setTripsData(() => waypoints.current);
    }

    useEffect(() => {
        if(!started) return;
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [started, time, animationEnded]);

    return (
        <>
            <div onContextMenu={(e) => { e.preventDefault(); }}>
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
                        getFillColor={[240, 112, 145, 35]}
                        opacity={selectionRadiusOpacity}
                    />
                    <TripsLayer
                        id={"pathfinding-layer"}
                        data={tripsData}
                        getPath={d => d.waypoints.map(p => p.coordinates)}
                        getTimestamps={d => d.waypoints.map(p => p.timestamp)}
                        getColor={(d) => {
                            if(d.color) return d.color;
                            const delta = Math.abs(time - d.timestamp);
                            const color = [
                                Math.max(70 - delta * 0.1, 70 / 2),
                                Math.max(183 - delta * 0.1, 183 / 2),
                                Math.max(128 - delta * 0.1, 64 / 2),
                            ];
                            return color;
                        }}
                        opacity={1}
                        widthMinPixels={3}
                        widthMaxPixels={5}
                        fadeTrail={false}
                        trailLength={6000}
                        currentTime={time}
                        updateTriggers={{
                            getColor: [time]
                        }}
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
                    <MapGL 
                        mapboxAccessToken={MAPBOX_ACCESS_TOKEN} 
                        reuseMaps mapLib={maplibregl} 
                        mapStyle={MAP_STYLE} 
                        doubleClickZoom={false}
                    />
                </DeckGL>
            </div>
            <Interface 
                canStart={!startNode || !endNode}
                started={started}
                animationEnded={animationEnded}
                time={time}
                startPathfinding={startPathfinding}
                toggleAnimation={toggleAnimation}
                clearPath={clearPath}
                timeChanged={setTime}
                maxTime={timer.current}
            />
        </>
    );
}

export default Map;