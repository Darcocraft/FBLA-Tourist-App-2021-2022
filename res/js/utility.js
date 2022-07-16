/*
  This file stores miscellenous general functions that are used throughout multiple files in the program
*/

//Rounds decimal value to specified decimal places
Math.roundTo = function (value, places) {
  return Math.round(value * 10 ** places) / 10 ** places;
};

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

//Converts between miles and meters
function milesToMeters(mi) {
  return mi * 1609.34;
}
function metersToMiles(meters) {
  return meters / 1609.34;
}

function formatTime(timeString) {
  const hour = parseInt(timeString.substring(0, 2));
  if (hour > 12) {
    return (hour % 12) + ":00 PM";
  } else if (hour == 12) {
    return "12:00 PM";
  } else {
    return hour + ":00 AM";
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isEmptyObject(object) {
  return JSON.stringify(object) === "{}";
}
