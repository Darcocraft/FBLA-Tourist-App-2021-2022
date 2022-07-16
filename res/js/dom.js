/*
  This file handles input function and some initilizations for elements of the index.html DOM
*/

/*Search Locoation Parameters ******************************************/
const searchRadiusInput = document.getElementById("searchRadiusInput");
const activitySelect = document.getElementById("activitySelect");
const subcategorySelect = document.getElementById("subcategorySelect");

//Distance
// updates radius of search radius
function updateSearchRadius() {
  map.markers.search.updateSearchRadius();
  updatePoi();
}

//Categories
let randomCatScrollInterval;
changeSubcategories();
function changeSubcategories() {
  switch (activitySelect.value) {
    case "eat":
      changeSubcatOptions(
        ["bagel", 13001],
        ["bakery", 13002],
        ["donut", 13043],
        ["bar", 13003],
        ["fast food", 13145],
        ["ice cream", 13046, 13045],
        ["smoothie", 13059, 13381],
        ["seafood", 13338],
        ["deli", 13039],
        ["pizza", 13064],
        ["restaurant", 13065]
      );
      break;
    case "play":
      changeSubcatOptions(
        ["amusement park", 10001, 10055],
        ["aquarium", 10002],
        ["arcade", 10003],
        ["sports field", 18000],
        ["beach", 16003],
        ["bicycle", 16004, 19002, 17119],
        ["boating", 19003, 18067],
        ["bowling alley", 10006],
        ["casino", 10008],
        ["martial arts", 18036],
        ["dance", 10012, 10013, 17032, 18025, 10021],
        ["day care", 11025, 11026],
        ["dog park", 16033],
        ["gun range", 18020],
        ["minigolf", 10023],
        ["roller rink", 10048],
        ["scuba diving", 18071],
        ["park", 16032],
        ["pool", 18075, 18076],
        ["movie theater", 10024],
        ["zoo", 10056]
      );
      break;
    case "relax":
      changeSubcatOptions(
        ["bar", 13003],
        ["beach", 16003],
        ["bicycle", 16004, 19002, 17119],
        ["boating", 19003, 18067],
        ["bookstore", 17018],
        ["brewery", 13029],
        ["country club", 10011, 10014, 18016],
        ["day care", 11025, 11026],
        ["massage", 11070, 11073],
        ["photography", 17024, 11137],
        ["pool", 18075, 18076]
      );
      break;
    case "shop":
      changeSubcatOptions(
        ["beauty", 17030, 17109, 11061],
        ["hair", 11064, 11062, 11067],
        ["apparel", 17020, 17031, 17043],
        ["bookstore", 17018],
        ["electronics", 11027, 17023, 17137],
        ["department store", 17033],
        ["flower shop", 17056],
        ["novelty", 17089, 17107, 17116],
        ["home goods", 17082],
        ["jewelry", 17045, 17051, 17044],
        ["shoes", 17048],
        ["shopping center", 17114, 17115],
        ["mall", 17114, 17104],
        ["toy shop", 17135, 17003, 17027, 17091]
      );
      break;
    case "explore":
      changeSubcatOptions(
        ["art gallery", 10004, 10047, 11005],
        ["bicycle", 16004, 19002, 17119],
        ["boating", 19003, 18067],
        ["campground", 16008],
        ["car rental", 19048],
        ["car wash", 11011],
        ["dog park", 16033],
        ["lake", 16023],
        ["landmark", 16026, 16034],
        ["mountain", 16027],
        ["museum", 16020, 16025, 10027, 10044],
        ["music", 10039, 14005],
        ["show venue", 10035],
        ["concert", 10037],
        ["park", 16032],
        ["pitstop", 13385],
        ["tour", 19028, 19008],
        ["wildlife sanctuary", 16028]
      );
      break;
  }
  function changeSubcatOptions(...options) {
    //removes select options
    for (i = subcategorySelect.options.length - 1; i >= 0; i--) {
      subcategorySelect.remove(i);
    }

    //adds new options
    for (let i = 0; i < options.length; i++) {
      const option = document.createElement("option");
      option.text = options[i][0];
      // console.log(options[i].slice(1));
      option.value = options[i].slice(1).join(",");
      subcategorySelect.add(option);
    }

    //randomly selects option
    let counter = 0;
    randomCatScrollInterval = setInterval(function () {
      if (counter < 10) {
        const ranOptionIndex = Math.floor(
          Math.random() * subcategorySelect.options.length
        );
        subcategorySelect.querySelectorAll("option")[ranOptionIndex].selected =
          "selected";
        counter++;
      } else {
        clearInterval(randomCatScrollInterval);
        updatePoi();
      }
    }, 200);
  }
}
function stopCategoryScroll() {
  clearInterval(randomCatScrollInterval);
}
//Star
const minStarInput = document.getElementById("minStar-input");
const maxStarInput = document.getElementById("maxStar-input");
function updateStarRange() {
  minStarInput.max = parseInt(maxStarInput.value) - 1 + "";
  maxStarInput.min = parseInt(minStarInput.value) + 1 + "";

  updatePoi();
  //Updates Pois
  // for (let i = map.markers.poi.length - 1; i >= 0; i--) {
  //   const marker = map.markers.poi[i];
  //   console.log(marker);
  //   const { place } = marker;
  //   if (
  //     !(
  //       place.rating >= minStarInput.value && place.rating <= maxStarInput.value
  //     )
  //   ) {
  //     marker.remove();
  //     marker.getElement().remove();
  //   }
  // }
}
//Price
const minPriceInput = document.getElementById("minPrice-input");
const maxPriceInput = document.getElementById("maxPrice-input");
function updatePriceRange() {
  minPriceInput.max = maxPriceInput.value;
  maxPriceInput.min = minPriceInput.value;

  updatePoi();
}

//Location Suggestion
const locationSuggestion = document.getElementById("location-suggestion");
let suggestedMarker;
function suggestMarker(marker) {
  locationSuggestion.textContent = marker.place.name;
  suggestedMarker = marker;
}
function useSuggestion() {
  selectLocation(suggestedMarker);
}

/* Side Bar ********************************/
const sidebar = document.getElementById("content-sidebar");
//Location Cards
const locationCardContainer = document.getElementById("locationCard-container");
const favoriteLocationsContainer = document.getElementById(
  "favoriteLocations-container"
);
const locationInfoContainer = document.getElementById("locationInfo-container");

function setSidebarWidth(width) {
  sidebar.style.width = width + "%";
  const main = document.getElementById("main");
  main.style.marginLeft = width + "%";
  main.style.width = 100 - width + "%";
  const mapContainer = document.getElementById("map-container");
  mapContainer.style.left = width + "%";
  mapContainer.style.width = 100 - width + "%";

  window.dispatchEvent(new Event("resize"));
  // setTimeout(() => {
  //   window.dispatchEvent(new Event("resize"));
  // }, 2000);
  const mapResizeInterval = setInterval(() => {
    window.dispatchEvent(new Event("resize"));
  }, 5);
  setTimeout(() => {
    clearInterval(mapResizeInterval);
  }, 500);
}

// Opens Sidebar with Location Info
function openSidebar(html) {
  // Sidebar animation
  setSidebarWidth(30);
  sidebar.scrollTop = 0;

  if (html !== undefined) {
    locationInfoContainer.innerHTML = "";
    if (typeof html === "string") {
      locationInfoContainer.innerHTML = html; //sets sidebar content to location's content
    } else {
      locationInfoContainer.appendChild(html);
    }
  }
}
// Closes Sidebar
function closeSidebar() {
  setSidebarWidth(0);
}
//TODO: allow initial card selection
function restoreCardView() {
  map.removeSelectedMarker();
  openSidebar(locationCardContainer);
}
function toggleFavorite(elm, markerIndex) {
  const marker = map.markers.poi[markerIndex];
  const el = marker.getElement();
  marker.isFavorited = !marker.isFavorited;
  marker.cardDiv.classList.toggle("favorited-card");
  if (marker.isFavorited) {
    elm.innerHTML = "★";
    el.style.zIndex = 2;
    addFavorite(marker);
  } else {
    elm.innerHTML = "✩";
    el.style.zIndex = 1;
    removeFavorite(marker);
  }
}

//Location image Carousel
// Next/previous controls
function plusSlides(marker, n) {
  showSlides(marker, (marker.slideIndex += n));
}

// Thumbnail image controls
function currentSlide(marker, n) {
  showSlides(marker, (marker.slideIndex = n));
}

// Display slideshow at index
function showSlides(marker, n) {
  var i;
  var slides = document.getElementsByClassName("slides");
  var dots = document.getElementsByClassName("slide-dot");
  if (n > slides.length) {
    marker.slideIndex = 1;
  }
  if (n < 1) {
    marker.slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" dot-active", "");
  }
  slides[marker.slideIndex - 1].style.display = "block";
  dots[marker.slideIndex - 1].className += " dot-active";
}

/*Lon Lat Input ***************************************/
const locationLonInput = document.getElementById("lon-input");
const locationLatInput = document.getElementById("lat-input");

// Updates location of 'Search Location' marker to location value of Longitude/Latitude Input
function updateSearchLocation(elm) {
  const searchCoords = map.markers.search.getLngLat();
  searchCoords[elm.id == locationLonInput.id ? "lng" : "lat"] = elm.value;
  setSearchCoords([searchCoords.lng, searchCoords.lat]);
}

// Changes text in lon/lat inputs to specified location
function setLocationInput([lon, lat]) {
  locationLonInput.value = Math.roundTo(lon, 4);
  locationLatInput.value = Math.roundTo(lat, 4);
}

/*Miscellaneous*/

//Initializes Collapseable HTML Conent
const coll = document.getElementsByClassName("collapseToggle");
for (let i = 0; i < coll.length; i++) {
  coll[i].nextElementSibling.style.display = "block";
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
      coll[i].textContent = "+";
    } else {
      content.style.display = "block";
      coll[i].textContent = "-";
    }
  });
}
