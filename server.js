'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
const superagent = require('superagent');

app.use(cors());


const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

// Get Location Data
app.get('/location', (request, response) => {
  // let geoData = require('./data/geo.json');
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

  superagent.get(url)
    .then(location => {
      let data = location.body;
      for (var i in data) {
        let display = new City(city, data[i]);
        response.send(display);
      }})
    .catch(error => handleError('LocationError: Sorry, something went wrong', request, response));
}
  // response.status(200).json(display);
);

// Location Constructor
function City(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
};

// Get Weather Data
app.get('/weather', (request, response) => {
  let weatherData = require('./data/darksky.json');
  let city = request.query.city;
  let display = weather(city, weatherData);
  response.status(200).json(display);
});

function weather (city, weatherData) {
  const weatherArr = [];
  let data = weatherData.daily.data;

  data.forEach(day => {
    let newObj = {};

    newObj.forecast = day.summary;
    newObj.time = new Date(day.time).toDateString();

    weatherArr.push(newObj);
  });
  return weatherArr;
}

// Error Handler

function handleError (error, request, response) {
  response.status(500).send(error);
}
// app.use('*', (request, response) => response.send('Sorry, something went wrong'));

app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
