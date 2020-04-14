'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');

app.use(cors());


const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.get('/location', (request, response) => {
  let geoData = require('./data/geo.json');
  let city = request.query.city;
  let display = new City(city, geoData[0]);

  function City(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData.display_name;
    this.latitude = geoData.lat;
    this.longitude = geoData.lon;
  }

  response.status(200).json(display);
});

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
