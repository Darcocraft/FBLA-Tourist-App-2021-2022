//Creates geocoder
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  placeholder: "Search for a location",
  mapboxgl: mapboxgl,
  reverseGeocode: true,
}).on("error", (err) => console.log(err));
