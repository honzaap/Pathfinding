import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import { createGeoJSONCircle } from "./helpers";

const MAPBOX_ACCESS_TOKEN = "sk.eyJ1IjoiaG9uemFhcCIsImEiOiJjbG5vdXRtNm8wamNuMnJxaTl5d2dwaWZpIn0.nRWrLVhRxw7hZpE67i4Xuw";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const INITIAL_VIEW_STATE = {
    longitude: -122.41669,
    latitude: 37.7853,
    zoom: 13,
    pitch: 0,
    bearing: 0
};

const pData = [
    {
        name: "Colma (COLM)",
        code:"CM", 
        address: "365 D Street, Colma CA 94014", 
        exits: 9000, 
        //coordinates: [-122.4047934014763, 37.784518734896004],
        contour: createGeoJSONCircle([-122.4047934014763, 37.784518734896004], 0.5)
    },
];

function App() {

    const pLayer = new PolygonLayer({
        id: "start-radius",
        data: pData,
        pickable: true,
        stroked: false,
        getPolygon: d => d.contour,
        getFillColor: [240, 112, 145],
        opacity: 0.1,
    });

    const onClick = (e) => {
        console.log(e.coordinate);
    };

    return (
        <div onContextMenu={(e) => {e.preventDefault();}} >
            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                onClick={onClick}
                layers={[pLayer]}
            >
                <Map 
                    mapboxAccessToken={MAPBOX_ACCESS_TOKEN} 
                    reuseMaps mapLib={maplibregl} 
                    mapStyle={MAP_STYLE} 
                    preventStyleDiffing={true} 
                />
            </DeckGL>
        </div>
    );
}

export default App;