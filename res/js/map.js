/*
  This file initializes a mapbox map object and creates the search marker and function to handle map changing events
*/

//Stores mapboxgl access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// Creates a map and displays it to the .map div
const map = new mapboxgl.Map({
  container: "map-container", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [-81.5158, 27.6648], // starting position [lng, lat]
  zoom: 4, // starting zoom
});

// Adds top right zoom navigation control once map loads
map.on("load", () => {
  map.addControl(
    new mapboxgl.NavigationControl({
      visualizePitch: true,
    })
  );

  // Initializes Search Radius Circle
  const circle = turf.circle([0, 0], 5, {
    steps: 10,
    units: "miles",
    properties: {},
  });

  map.addSource("searchRadius", {
    type: "geojson",
    data: circle,
  });

  map.addLayer({
    id: "circle-fill",
    type: "fill",
    source: "searchRadius",
    paint: {
      "fill-color": "lightblue",
      "fill-opacity": 0.5,
    },
  });

  // Updates Search Radiius Circle Position and Size
  map.markers.search.updateSearchRadius();
});

map.markers = {
  //Creates 'Search Location' marker
  search: createPictureMarker(
    `./res/images/icons/search-icon.png`,
    30,
    30,
    0,
    0,
    {
      draggable: true,
    }
  )
    .addTo(map)
    .setPopup(
      new mapboxgl.Popup({ offset: 20 }).setHTML(
        `<div>
        <h3>Search Location</h3>
        <p>This is the location from which attraction searches are conducted. Drag to move it to a new location on the map, or enter in a
        longitude and latitue into the top left input. Alternatively, you can use your current location</p>
        <button onclick="getUserLocation('Geolocation').then(coords=>setSearchCoords(coords))">Use My Location</button>
      </div>`
      )
    )
    .on("drag", () => {
      // Updates location input text to new coordinates while user drags 'Search Location' element
      const { lng: lon, lat } = map.markers.search.getLngLat();
      setLocationInput([lon, lat]);
      // directions.setOrigin([lon, lat]);
      map.markers.search.updateSearchRadius();
    })
    .on("dragend", () => updatePoi()),
  selected: null,
  poi: [],
};

// Updates Search Radius Circle Size
map.markers.search.updateSearchRadius = () => {
  const { lng: lon, lat } = map.markers.search.getLngLat();
  map.getSource("searchRadius").setData(
    turf.circle([lon, lat], searchRadiusInput.value, {
      steps: 50,
      units: "miles",
      properties: {},
    })
  );
};

//Updates search coordianates
function setSearchCoords(coords, updatePois = true) {
  const [lon, lat] = coords;
  setLocationInput(coords); //Updates coords input

  // Updates geocoder location bias
  geocoder.setProximity({
    longitude: lon,
    latitude: lat,
  });
  map.markers.search.setLngLat([lon, lat]);
  // directions.setOrigin([lon, lat]);
  map.markers.search.updateSearchRadius();

  map.focusMarker(map.markers.search);
  if (updatePois) updatePoi();
}

// Creates and returns a marker at with an image at the specified location and with the specified attributes
function createPictureMarker(imgSrc, width, height, lat, lon, options = {}) {
  const el = document.createElement("div");
  el.className = "marker";
  el.style.backgroundImage = `url(${imgSrc})`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  return new mapboxgl.Marker({ element: el, ...options }).setLngLat([lat, lon]);
}

// Animates map's camera moving to specified marker
map.focusMarker = function (marker, zoom = map.getZoom(), duration = 3000) {
  let { lng, lat } = marker.getLngLat();
  map.easeTo({
    center: [lng, lat],
    zoom,
    duration,
  });
};

// Changes a default marker's main color
map.setMarkerColor = function (marker, color) {
  marker
    .getElement()
    .firstElementChild.firstElementChild.children[1].setAttribute(
      "fill",
      color
    );
};

map.removeSelectedMarker = function () {
  if (map.markers.selected != null) {
    const marker = map.markers.poi[map.markers.selected];
    if (marker.isFavorited) {
      map.setMarkerColor(marker, "gold");
    } else {
      map.setMarkerColor(marker, "#3FB1CE");
    }
    marker.getElement().style.zIndex = "1";
  }
};
