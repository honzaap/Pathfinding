import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PolygonLayer } from "@deck.gl/layers";
import { createGeoJSONCircle } from "../helpers";
import { useState } from "react";
import { getNearestNode, getBoundingBoxFromPolygon } from "../services/MapService";


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
    const [polygonLayer, setPolygonLayer] = useState([]);

    const onClick = async (e) => {
        console.log(e.coordinate);
        const nearestNode = await getNearestNode(e.coordinate[1], e.coordinate[0]);
        const circle = createGeoJSONCircle([nearestNode.lon, nearestNode.lat], 0.01);

        const bb = getBoundingBoxFromPolygon(circle);
        console.log(bb);

        setPolygonLayer([
            { contour: circle }
        ]);
    };

    return (
        <div onContextMenu={(e) => {e.preventDefault();}}>
            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={{ doubleClickZoom: false }}
                onClick={onClick}
            >
                <PolygonLayer 
                    id={"start-radius"}
                    data={polygonLayer}
                    pickable={true}
                    stroked={false}
                    getPolygon={d => d.contour}
                    getFillColor={[240, 112, 145]}
                    opacity={0.1}
                />
                <Map 
                    mapboxAccessToken={MAPBOX_ACCESS_TOKEN} 
                    reuseMaps mapLib={maplibregl} 
                    mapStyle={MAP_STYLE} 
                    doubleClickZoom={false}
                />
            </DeckGL>
        </div>
    );
}

export default App;