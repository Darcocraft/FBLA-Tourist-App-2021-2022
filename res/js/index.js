//Initializes search location after map loads
map.on("load", () => {
  loadFavorites();
  setSearchCoords([-82.3952, 28.0211], false);
  map.focusMarker(map.markers.search, 10);
});
