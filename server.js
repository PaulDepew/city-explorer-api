'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');

app.use(cors());


const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

// Get Location Data
app.get('/location', (request, response) => {
  let geoData = require('./data/geo.json');
  let city = request.query.city;
  let display = new City(city, geoData[0]);

  // Location Constructor
  function City(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData.display_name;
    this.latitude = geoData.lat;
    this.longitude = geoData.lon;
  }

  response.status(200).json(display);
});


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
    newObj.time = new Date(day.time);

    weatherArr.push(newObj);
  });
  return weatherArr;
}

// app.get('/data', (request, response) => {
//   let airplanes = {
//     departure: Date.now(),
//     canFly: true,
//     pilot: 'Well Trained',
//   };
//   response.status(200).json(airplanes);
// });

app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
