'use strict';

// require and initiate libraries
require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');

const cors = require('cors');
const superagent = require('superagent');

app.use(cors());


const PORT = process.env.PORT || 3000;

const dbClient = new pg.Client(process.env.DATABASE_URL);

dbClient.connect(error => {
  if (error) {
    console.error('This was an Error', error.stack);
  } else {
    console.log('Were connected');
  }
});

app.use(express.static('./public'));

// Get Location Data
app.get('/location', (request, response) => {
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
  // SQL Request
  let insertSQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *`;
  // let matchSQL = `SELECT * FROM locations WHERE search_query = ($1);`;
  // let cityValue = [city];

  superagent.get(url)
    .then(location => {
      let data = location.body;
      let SQLvalues = [city, data[0].formatted_query, data[0].latitude, data[0].longitude];

      // write new row and records/saves to db
      dbClient.query(insertSQL, SQLvalues).then(record => {
        console.log(record.rows);
      }).catch(error => {
        handleError('Database Failed', request, response);
      })

      // loop to checkl for location
      for (var i in data) {
        let display = new City(city, data[i]);
        response.send(display);
      }})
    .catch(error => handleError('LocationError: Sorry, something went wrong', request, response));
}
);


// Location Constructor
function City(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
};


// Trails Constructor
function Trails(element) {
  this.name = element.name;
  this.location = element.location;
  this.length = element.length;
  this.stars = element.stars;
  this.star_votes = element.starVotes;
  this.summer = element.summery;

  this.trail_url = element.url;
  this.conditions = element.conditionDetails;

  this.condition_date = new Date(splitDate(element.conditionDate[0])).toDateString();
  this.condition_time = splitDate(element.conditionDate)[1];
}

const splitDate = (str) => str.split(' ');

// Get Weather Data
app.get('/weather', (request, response) => {
  let {latitude, longitude} = request.query;
  let city = request.query.city;
  let key = process.env.WEATHER_API_KEY;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key}`;

  superagent.get(url)
    .then(weatherResponse => {
      const weatherData = weatherResponse.body.data;
      let display = weather(city, weatherData);
      response.send(display);
    }).catch(error => handleError('Weather Data went wrong', request, response));

});


// Create Weather Objects
function weather (city, weatherData) {
  const weatherArr = [];
  weatherData.forEach(day => {
    let newObj = {};

    newObj.forecast = day.weather.description;
    newObj.time = new Date(day.datetime).toDateString();

    weatherArr.push(newObj);
  });
  return weatherArr;
}

// Get Trails
function handleTrails (request, response) {
  let {latitude, longitude} = request.query;
  const key = process.env.TRAIL_API_KEY;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key}`;

  superagent.get(url).then(trailResponse => {
    const data = trailResponse.body.trails;
    response.send(data.map(element => {
      return new Trails(element);
    }));
  }).catch(error => handleError('Trail Error@!!@', request, response));
}

app.get('/trails', handleTrails);

// Error Handler
function handleError (error, request, response) {
  response.status(500).send(error);
}


app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
