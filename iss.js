// Define a function fetchMyIP which will asynchronously return our IP Address using an API.
/*
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');

////// this is the first API call to get my ip
const fetchMyIP = function (callback) {
  let URL = `https://api.ipify.org?format=json`;
  // use request to fetch IP address from JSON API
  // this is the start of the request using the url provided
  request(URL, function (error, response, body) {
  // start of error condition checking
    if (error) {
      callback(error, null);
      return;
    }
    // if non 200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    // if no errors occur, this code parses the data using JSON for the body
    const ip = JSON.parse(body).ip;
    callback(null, ip);

    // if no data is found, return an error message and null body
    if (!body) {
      callback('No data found', null);
      return;
    }
  });
};

////// this is the second API call to get the coordinates
const fetchCoordsByIP = function (ip, callback) {
  let URL = `https://freegeoip.app/json/${ip}`;

  request(URL, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    // this returns the coordinates
    const {latitude, longitude} = JSON.parse(body);
    callback(null, {latitude, longitude});

    // if no data is found, return an error message and null body
    if (!body) {
      callback('No data found', null);
      return;
    }
  });
};

////// this next part is a third API call which will get ISS flyovers for a given location
const fetchISSFlyOverTimes = function (coords, callback) {
  let URL = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(URL, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // this returns when the ISS passes over my latitude/longitude
    const passes = JSON.parse(body).response;
    callback(null, passes);

    // if no data is found, return an error message and null body
    if (!body) {
      callback('No data found', null);
      return;
    }
  });
};


////// this final part chains together all the API requests and
const nextISSTimesForMyLocation = function(callback) {
  // include three nested callbacks so each is implemented in turn
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });


};

//module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };
module.exports = { nextISSTimesForMyLocation };