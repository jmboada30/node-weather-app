const axios = require('axios');
const { saveDB, readDB } = require('../helpers/save-data');

class Searches {
  recordsArr = [];

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY || '',
      limit: '5',
      language: 'es',
    };
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY_FH || '',
      units: 'metric',
      lang: 'es',
    };
  }

  get getAllRecords() {
    if (!this.recordsArr.length) return;

    this.recordsArr.forEach((record, i) => {
      const idx = `${++i}.`.green;
      console.log(`${idx} ${this.toCapitalize(record)}`);
    });
  }

  constructor(params) {
    this.recordsArr = readDB();
  }

  async getCities(place = '') {
    const instance = axios.create({
      baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
      params: this.paramsMapbox,
    });

    try {
      const resp = await instance.get();
      return resp.data.features.map((place) => ({
        id: place.id,
        desc: place.place_name,
        lng: place.center[0],
        lat: place.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  async getWeatherByPlace(lat = 0, lon = 0) {
    const instance = axios.create({
      baseURL: 'https://api.openweathermap.org/data/2.5/weather',
      params: { ...this.paramsWeather, lat, lon },
    });

    try {
      const resp = await instance.get();
      const { weather, main } = resp.data;
      return {
        desc: weather[0].description,
        temperatura: main.temp,
        min: main.temp_min,
        max: main.temp_max,
      };
    } catch (error) {
      console.log('error :>> ', error);
      return {
        desc: 'Sin datos',
        temperatura: 0,
        min: 0,
        max: 0,
      };
    }
  }

  addRecord(place = '') {
    if (this.recordsArr.includes(place.toLowerCase())) return;

    this.recordsArr = this.recordsArr.splice(0, 5);

    this.recordsArr.unshift(place.toLowerCase());

    saveDB(this.recordsArr);
  }

  toCapitalize(sentence = ' ') {
    let words = sentence.split(' ');
    words = words.map((w) => w[0].toUpperCase() + w.substring(1));
    return words.join(' ');
  }
}

module.exports = Searches;
