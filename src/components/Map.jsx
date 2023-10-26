import DeckGL from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { createGeoJSONCircle, rgbToArray } from "../helpers";
import { useEffect, useRef, useState } from "react";
import { getBoundingBoxFromPolygon, getMapGraph, getNearestNode } from "../services/MapService";
import PathfindingState from "../models/PathfindingState";
import Interface from "./Interface";
import { INITIAL_COLORS, INITIAL_VIEW_STATE, MAPBOX_ACCESS_TOKEN, MAP_STYLE } from "../config";
import useSmoothStateChange from "../hooks/useSmoothStateChange";

function Map() {
    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [selectionRadius, setSelectionRadius] = useState([]); // TODO : animation group
    const [tripsData, setTripsData] = useState([]); // TODO : animation group
    const [started, setStarted] = useState(); // TODO : animation group
    const [time, setTime] = useState(0); // TODO : animation group
    const [animationEnded, setAnimationEnded] = useState(false); // TODO : animation group
    const [playbackOn, setPlaybackOn] = useState(false); // TODO : animation group
    const [fadeRadiusReverse, setFadeRadiusReverse] = useState(false); // TODO : animation group
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        algorithm: "astar",
        radius: 2,
        speed: 1, 
    });
    const [colors, setColors] = useState(INITIAL_COLORS);
    const ui = useRef();
    const fadeRadius = useRef();
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const timer = useRef(0);
    const waypoints = useRef([]);
    const state = useRef(new PathfindingState());
    const traceNode = useRef(null);
    const selectionRadiusOpacity = useSmoothStateChange(0, 0, 1, 400, fadeRadius.current, fadeRadiusReverse);

    async function mapClick(e, info) {
        if(started && !animationEnded) return;

        setFadeRadiusReverse(false);
        fadeRadius.current = true;
        clearPath();

        if(info.rightButton) {
            if(e.layer?.id !== "selection-radius") {
                ui.current.showSnack("Please select a point inside the radius.", "info");
                return;
            }

            if(loading) {
                ui.current.showSnack("Please wait for all data to load.", "info");
                return;
            }

            const loadingHandle = setTimeout(() => {
                setLoading(true);
            }, 300);
            
            const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
            const realEndNode = state.current.getNode(node.id);
            setEndNode(node);
            
            clearTimeout(loadingHandle);
            setLoading(false);

            if(!realEndNode) {
                ui.current.showSnack("An error occurred. Please try again.");
                return;
            }
            state.current.endNode = realEndNode;
            
            return;
        }

        const loadingHandle = setTimeout(() => {
            setLoading(true);
        }, 300);

        const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
        setStartNode(node);
        setEndNode(null);
        const circle = createGeoJSONCircle([node.lon, node.lat], settings.radius);
        setSelectionRadius([{ contour: circle}]);
        
        getMapGraph(getBoundingBoxFromPolygon(circle), node.id).then(graph => {
            state.current.graph = graph;
            clearPath();
            clearTimeout(loadingHandle);
            setLoading(false);
        });
    }

    function startPathfinding() {
        setFadeRadiusReverse(true);
        setTimeout(() => {
            clearPath();
            state.current.start();
            setStarted(true);
        }, 400);
    }

    function toggleAnimation() {
        if(animationEnded) {
            if(time >= timer.current) {
                setTime(0);
            }
            setStarted(true);
            setPlaybackOn(!playbackOn);
            return;
        }
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
            updateWaypoints(parentNode, traceNode.current, "route");
            traceNode.current = parentNode ?? traceNode.current;
            setAnimationEnded(time >= timer.current && parentNode == null);
        }

        // Animation progress
        if (previousTimeRef.current != null && !animationEnded) {
            const deltaTime = newTime - previousTimeRef.current;
            setTime(prevTime => (prevTime + deltaTime * settings.speed));
        }

        // Playback progress
        if(previousTimeRef.current != null && animationEnded && playbackOn) {
            const deltaTime = newTime - previousTimeRef.current;
            if(time >= timer.current) {
                setPlaybackOn(false);
            }
            setTime(prevTime => (prevTime + deltaTime * settings.speed));
        }

        previousTimeRef.current = newTime;
        requestRef.current = requestAnimationFrame(animate);
    }

    function updateWaypoints(node, refererNode, color = "path") {
        if(!node || !refererNode) return;
        const distance = Math.hypot(node.longitude - refererNode.longitude, node.latitude - refererNode.latitude);
        const timeAdd = distance * 50000;

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
    }, [started, time, animationEnded, playbackOn]);

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
                        stroked={true}
                        getPolygon={d => d.contour}
                        getFillColor={[80, 210, 0, 10]}
                        getLineColor={[9, 142, 46, 175]}
                        getLineWidth={3}
                        opacity={selectionRadiusOpacity}
                    />
                    <TripsLayer
                        id={"pathfinding-layer"}
                        data={tripsData}
                        getPath={d => d.waypoints.map(p => p.coordinates)}
                        getTimestamps={d => d.waypoints.map(p => p.timestamp)}
                        getColor={(d) => {
                            if(d.color !== "path") return rgbToArray(colors[d.color]);
                            const color = rgbToArray(colors[d.color]);
                            const delta = Math.abs(time - d.timestamp);
                            return color.map(c => Math.max((c * 1.6) - delta * 0.1, c));
                        }}
                        opacity={1}
                        widthMinPixels={3}
                        widthMaxPixels={5}
                        fadeTrail={false}
                        trailLength={6000}
                        currentTime={time}
                        updateTriggers={{
                            getColor: [time, colors.path, colors.route]
                        }}
                    />
                    <ScatterplotLayer 
                        id="start-end-points"
                        data={[
                            ...(startNode ? [{ coordinates: [startNode.lon, startNode.lat], color: rgbToArray(colors.startNodeFill), lineColor: rgbToArray(colors.startNodeBorder) }] : []),
                            ...(endNode ? [{ coordinates: [endNode.lon, endNode.lat], color: rgbToArray(colors.endNodeFill), lineColor: rgbToArray(colors.endNodeBorder) }] : []),
                        ]}
                        pickable={true}
                        opacity={1}
                        stroked={true}
                        filled={true}
                        radiusScale={1}
                        radiusMinPixels={7}
                        radiusMaxPixels={20}
                        lineWidthMinPixels={1}
                        lineWidthMaxPixels={3}
                        getPosition={d => d.coordinates}
                        getFillColor={d => d.color}
                        getLineColor={d => d.lineColor}
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
                ref={ui}
                canStart={!startNode || !endNode}
                started={started}
                animationEnded={animationEnded}
                playbackOn={playbackOn}
                time={time}
                startPathfinding={startPathfinding}
                toggleAnimation={toggleAnimation}
                clearPath={clearPath}
                timeChanged={setTime}
                maxTime={timer.current}
                settings={settings}
                setSettings={setSettings}
                colors={colors}
                setColors={setColors}
                loading={loading}
            />
        </>
    );
}

export default Map;