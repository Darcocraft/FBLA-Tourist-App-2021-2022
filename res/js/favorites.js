/*
  This file handles storing and loading favorited location data in browser memory.
*/

var favorites = [];
function addFavorite(marker) {
  favorites.push(marker.place);

  localStorage.setItem("favoriteMarkers", JSON.stringify(favorites));
}
function removeFavorite(marker) {
  favorites = favorites.filter((elm) => elm != marker.place);

  localStorage.setItem("favoriteMarkers", JSON.stringify(favorites));
}

function loadFavorites() {
  const loadedFavorites = JSON.parse(localStorage.getItem("favoriteMarkers"));

  for (const place of loadedFavorites) {
    const marker = placeToMarker(place);

    map.markers.poi.push(marker);
    toggleFavorite(
      marker.placeInfoDiv.querySelector(".favoriteBtn"),
      map.markers.poi.length - 1
    );
    map.setMarkerColor(marker, "gold");

    favoriteLocationsContainer.appendChild(marker.cardDiv);

    marker.addTo(map);
  }

  if (loadedFavorites.length != 0) {
    window.alert(
      "Loaded " +
        loadedFavorites.length +
        " favorited locations from previous sessions."
    );
  }
}
