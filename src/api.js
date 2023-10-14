export async function fetchOverpassData(boundingBox, ways = true) {
    const query = `
    [out:json];(
        ${ways ? "way" : "node"}[highway][highway!="footway"][highway!="street_lamp"][footway!="*"]
        (${boundingBox[0].latitude},${boundingBox[0].longitude},${boundingBox[1].latitude},${boundingBox[1].longitude});
        ${ways ? "node(w);" : ""}
    );
    out skel;`;

    return await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
    });
}