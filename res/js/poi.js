/*
  this file uses the foursquare API to retrieve points of interest data based on user search
*/

var cachedPoi = [];

// Updates locations based on search
function updatePoi() {
  // stores user type of locaiton
  const locType =
    subcategorySelect.options[subcategorySelect.selectedIndex].text;
  const categoryIds = subcategorySelect.value;

  map.removeSelectedMarker();
  map.markers.selected = null;

  // Resets Markers
  let kept = 0;
  map.markers.poi = map.markers.poi.filter((marker, i) => {
    // Keeps Favorited Marker
    if (!marker.isFavorited) {
      marker.remove();
      marker.getElement().remove();
      return false;
    } else {
      marker.index = kept;
      kept++;
      return true;
    }
  });

  //Retrieves User Search Specifications
  const { lng, lat } = map.markers.search.getLngLat();
  const radiusM = Math.round(milesToMeters(searchRadiusInput.value));
  const minPrice = minPriceInput.value;
  const maxPrice = maxPriceInput.value;
  const minRating = minStarInput.value;
  const maxRating = maxStarInput.value;

  const limit = 50;

  // Foursquare API request options
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: FOURSQUARE_API_KEY,
    },
  };

  //Loading Icon
  locationCardContainer.innerHTML = `<img src="res/images/gif/loading.gif" width="100%">`;

  //Requests POI data from foursquare API
  fetch(
    `https://api.foursquare.com/v3/places/search?query=${locType}&ll=${lat},${lng}&radius=${radiusM}&min_price=${minPrice}&max_price=${maxPrice}&limit=${limit}&categories=${categoryIds}&fields=fsq_id,name,geocodes,location,categories,chains,related_places,distance,link,description,tel,email,website,social_media,verified,hours,hours_popular,rating,popularity,price,menu,date_closed,photos,tips,tastes,features`,
    options
  )
    .then((response) => response.json())
    .then(({ results }) => {
      locationCardContainer.innerHTML = "";

      if (results.length == 0) {
        locationCardContainer.innerHTML =
          "<br><h3 style='text-align:center'>0 Results For your Search</h3>";
        loadCachedPoi();
      } else {
        locationCardContainer.appendChild(favoriteLocationsContainer);
        if (map.markers.poi.length > 0) {
          //Adds favorited cards to card list
          favoriteLocationsContainer.innerHTML =
            "<h3 style='text-align:center'>Previous Favorites:</h3>";
          map.markers.poi.forEach(({ cardDiv }) =>
            favoriteLocationsContainer.appendChild(cardDiv)
          );
        }
      }

      let bestRatedPlace; //used to find best rated place for recommendation.

      //creates a new marker for each POI
      for (const place of results) {
        //Checks if place satisfies rating specification
        if (place.rating) {
          if (!(place.rating > minRating && place.rating < maxRating)) continue;
        } else if (minRating > 4) {
          //shows unrated places only if minimum rating is low
          continue;
        }

        //Checks if place has specified geocode location
        if (!place.geocodes?.main) continue;

        const marker = placeToMarker(place);

        //Determines the place with the best rating for suggesting
        if (
          !bestRatedPlace ||
          (marker.place.rating && bestRatedPlace.rating < place.rating)
        )
          bestRatedPlace = marker;

        //Appends and Stores Marker
        map.markers.poi.push(marker);
        marker.addTo(map);

        //Adds location cards to card view
        favoriteLocationsContainer.insertAdjacentElement(
          "beforebegin",
          marker.cardDiv
        );

        //caches Marker
        cachedPoi.push(marker);

        //Updates Suggested marker
        suggestMarker(bestRatedPlace);
      }

      restoreCardView();
    })
    .catch((err) => {
      //In case of error (Connection Lost), displays cached locations.
      console.log("Using Cache");

      //Loads Cached Locations on fetch failure
      locationCardContainer.innerHTML = `
        <br>
        <h3 style = 'text-align:center;color:red'>Error: Lost Internet Connection</h3>`;
      loadCachedPoi();

      console.log(err);
    });

  //Displays locations from cache to map
  function loadCachedPoi() {
    map.markers.poi = cachedPoi;
    cachedPoiContainer = document.createElement("div");
    locationCardContainer.appendChild(cachedPoiContainer);
    cachedPoiContainer.innerHTML += `<h3 style = 'text-align:center;Color:lightgrey' >Previous Search Results: </h3 > `;
    cachedPoi.forEach((marker) => {
      cachedPoiContainer.appendChild(marker.cardDiv);
      marker.addTo(map);
    });
  }
}

//Converts place data to a maker object with html displaying data
function placeToMarker(place) {
  //Creates Marker
  const { latitude, longitude } = place.geocodes.main;
  const marker = new mapboxgl.Marker().setLngLat([longitude, latitude]);
  marker.index = map.markers.poi.length;
  marker.isFavorited = false;
  marker.place = place;
  const el = marker.getElement();
  el.style = "cursor: pointer";
  el.addEventListener("click", () => selectLocation(marker));

  //Creates Basic Card for Location
  marker.cardDiv = document.createElement("div");
  marker.cardDiv.className = "locationCard";
  marker.cardDiv.onclick = () => selectLocation(marker);
  marker.cardDiv.innerHTML += `
          <h3>${place.name}</h3>
          <p>${cutOffText(ifDefinedString(place.description), 100)}</p>
          <address>${place.location.formatted_address}</address>
          <p>${Math.round(metersToMiles(place.distance))} mi</p>
          <div style="font-size:15px;position:relative;">
            ${place.rating ? place.rating + "⭐" : ""}
            <div style="display:inline;padding-left:30px;font-size:inherit">
              <span style="display:inline;color: green">${"$".repeat(
                place.price
              )}</span>
              <span style="display:inline;color:black;">${"$".repeat(
                4 - place.price
              )}</span>
            </div>
            <div style="display:inline;padding-left:30px;font-size:inherit">
              ${
                place.popularity
                  ? Math.round(place.popularity * 100) + "%👤"
                  : ""
              }
            </div>
          </div>
        `;

  //Creates Page for Location
  // Creates image slideshow using location photos
  marker.placeInfoDiv = document.createElement("div");
  marker.placeInfoDiv.innerHTML = `
          <div class="placeInfo-container">
              <div class="location-categoryIcon-container">
                ${
                  // Creates Category HTML Card for each category of locaiton
                  place.categories
                    .map(({ name, icon }) => {
                      return `
                      <div class="location-icon">
                        <img src="${icon.prefix}bg_32${icon.suffix}">
                        <p class="location-iconLabel">${name}</p>
                      </div>
                      `;
                    })
                    .join("")
                }
              </div>
              <div class="favoriteBtn" onclick="toggleFavorite(this, ${
                marker.index
              })">✩</div>

            <div>
              ${place.rating ? "Rating: " + place.rating + " / 10⭐" : ""}
              <div style="display:inline;padding-left:5px">
              Price: 
                <span style="display:inline;color: green">${"$".repeat(
                  place.price
                )}</span>
                <span style="display:inline;color:black;">${"$".repeat(
                  4 - place.price
                )}</span>
              </div>
              <div style="display:inline;padding-left:5px">
                ${
                  place.popularity
                    ? "Popularity: " +
                      Math.round(place.popularity * 100) +
                      "%👤"
                    : ""
                }
              </div>
            </div>

            ${
              place.website
                ? `
                <a href="${place.website}" target="_blank" rel="noopener noreferrer">
                  <h2>${place.name}</h2>
                </a>
              `
                : `<h2>${place.name}</h2>`
            }
           

            <address>${place.location.formatted_address}</address>
            
            ${place.hours.display ? `<p>${place.hours.display}</p>` : ""}
            ${
              place.hours.open_now === undefined
                ? ""
                : `<p>Currently ${place.hours.open_now ? "open" : "closed"}</p>`
            }

            ${
              place.photos.length == 0
                ? ""
                : `
                <div class='slideshow-container'>
                  ${place.photos
                    .map(
                      (photo, i) => `
                      <div class="slides fade">
                        <div class="slide-numbertext">
                          ${i + 1} / ${place.photos.length}
                        </div>   
                        <img class="center location-img" src="${
                          photo.prefix + "original" + photo.suffix
                        }">
                        <div class="caption">
                          ${
                            photo.classifications
                              ? photo.classifications.join(", ")
                              : ""
                          }
                        </div>
                      </div>`
                    )
                    .join("")}
                    <a class="prev" onclick="plusSlides(map.markers.poi[${
                      marker.index
                    }], -1)">&#10094;</a>
                    <a class="next" onclick="plusSlides(map.markers.poi[${
                      marker.index
                    }],  1)">&#10095;</a>

                  </div>
                  <br>

                  <!-- The dots/circles -->
                  <div style="text-align:center">
                    ${place.photos.reduce(
                      (html, photo, i) =>
                        html +
                        `<span class="slide-dot" onclick="currentSlide(map.markers.poi[${
                          marker.index
                        }], ${i + 1})"></span>`,
                      ""
                    )}

                    ${(marker.slideIndex = 1) == 1 ? "" : ""}
                </div>
              `
            }
            
            ${
              place.hours_popular
                ? `
              <h3>Popular Hours Today</h3>
              ${place.hours_popular
                .map((hours) => {
                  if (hours.day == 1 + new Date().getDay()) {
                    return `
                    <p>${formatTime(hours.open)}-${formatTime(hours.close)}</p>
                  `;
                  }
                  return "";
                })
                .join("")}
              `
                : ""
            }
            
            ${
              place.tips.lenth > 0
                ? "<h3>Tips</h3>" +
                  place.tips
                    .map((tip, i) => {
                      for (let nextTip of place.tips.slice(i + 1)) {
                        if (nextTip.text == tip.text) return "";
                      }
                      if (tip.text.trim() == "") return "";
                      return `
                        <div class="tip-card">
                          <img width="70px" src="https://avatars.dicebear.com/api/avataaars/${tip.text
                            .substring(0, 20)
                            .replace(
                              /[^a-zA-Z]+/g,
                              ""
                            )}.svg?style=circle&mouth=${randomElement([
                        "default",
                        "eating",
                        "serious",
                        "smile",
                        "tongue",
                        "twinkle",
                      ])}">
                          <p>${tip.text}</p>
                          <h6 style="margin:0">${formatDate(
                            tip.created_at
                          )}</h6>
                        </div>
                      `;
                    })
                    .join("")
                : ""
            }

            <div>
              <h3>Contact</h3>
              ${
                place.website
                  ? `
                <p>Website:
                  <a href="${place.website}" target="_blank" rel="noopener noreferrer">
                  ${place.website}
                  </a>
                </p>`
                  : ""
              }
              ${
                place.email
                  ? `
                <p>Email:
                  <a href="mailto:${place.email}">${place.email}</a>
                </p>`
                  : ""
              }
              ${
                place.tel
                  ? `
                <p>Phone:
                  <a href="tel:${place.tel}">${place.tel}</a>
                </p>`
                  : ""
              }
              ${
                isEmptyObject(place.social_media)
                  ? ""
                  : `
                  <div>
                    <h4>Socials</h4>
                    ${
                      place.social_media.facebook_id
                        ? `
                    <a href="https://www.facebook.com/${place.social_media.facebook_id}" target="_blank" rel="noopener noreferrer">
                      <img src="./res/images/icons/facebook-icon.png" class="media-icon">
                    </a>
                    `
                        : ""
                    }
                    ${
                      place.social_media.twitter
                        ? `
                    <a href="https://twitter.com/${place.social_media.twitter}" target="_blank" rel="noopener noreferrer">
                      <img src="./res/images/icons/twitter-icon.png" class="media-icon">
                    </a>
                  </div>
                  `
                        : ""
                    }
                `
              }
            </div>
          </div>
        `;

  return marker;

  function ifDefinedString(value) {
    return value == undefined ? "" : value;
  }
  function cutOffText(text, charCount) {
    if (text.length > charCount) {
      let i = charCount;
      while (text.charAt(i) !== " ") {
        i--;
      }
      return text.substring(0, i) + "...";
    }
    return text;
  }
}

//Location Marker Selection
function selectLocation(marker) {
  //Resets Styles of previously selected marker
  map.removeSelectedMarker();

  map.markers.selected = marker.index;
  map.focusMarker(marker);
  map.setMarkerColor(marker, "red");

  marker.getElement().style.zIndex = "2";

  openSidebar(marker.placeInfoDiv);
  setSidebarWidth(40);

  sidebar.scrollTop = 0;
  if (marker.slideIndex !== undefined) currentSlide(marker, 1);
}
