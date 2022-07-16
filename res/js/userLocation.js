/* Returns the approximate longitude and latitude of the users's machine. This is either accomplished by making a request to the
    ipgeolocaton API or by using the built in Geolocation API for better location accuracy*/
function getUserLocation(method) {
  let coords;
  switch (method) {
    case "IP":
      coords = fetch(
        "https://ipgeolocation.abstractapi.com/v1/?api_key=" +
          IPGEOLOCATOIN_API_KEY
      )
        .then((res) => res.json())
        .then(({ longitude: lon, latitude: lat }) => [lon, lat]);
      break;
    case "Geolocation":
      coords = new Promise((resolve) =>
        navigator.geolocation.getCurrentPosition(
          ({ coords: { longitude: lon, latitude: lat } }) => {
            resolve([lon, lat]);
          },
          () => {
            const { lng: lon, lat } = map.markers.search.getLngLat();
            resolve([lon, lat]);
          },
          { enableHighAccuracy: true }
        )
      );
      break;
  }

  return coords;
}
