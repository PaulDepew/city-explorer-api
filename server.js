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
  let {latitude, longitude} = request.query;
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

function weather (city, weatherData) {
  const weatherArr = [];
  weatherData.forEach(day => {
    let newObj = {};

    newObj.forecast = day.weather.description;
    newObj.time = new Date(day.datetime).toDateString();

    weatherArr.push(newObj);
  });
  console.log(weatherArr);
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
