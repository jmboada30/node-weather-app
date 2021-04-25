require('dotenv').config();
require('colors');
const {
  inquirerMenu,
  readInput,
  stop,
  listFromArray,
} = require('./helpers/inquirer');
const Searches = require('./models/searches');

const main = async () => {
  const searches = new Searches();
  let opt = 0;
  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        // Indicar un parametro para buscar
        const search = await readInput('Ciudad: ');

        // Buscar lugares con Axios y mapbox
        const places = await searches.getCities(search);

        // Seleccionar un lugar
        const { id } = await listFromArray(places, 'Lista de lugares');
        if (id === 0) continue;

        const placeSelected = places.find((place) => place.id === id);

        // Persistir data
        searches.addRecord(placeSelected.desc);

        // Obtener clima
        const weather = await searches.getWeatherByPlace(
          placeSelected.lat,
          placeSelected.lng
        );
        console.log(weather);
        // Resultados
        detailsPlaceSelected(placeSelected, weather);
        //
        break;
      case 2: // Historial
        searches.getAllRecords;
        break;
      case 3: //Salir
        console.log('Hasta luego');
        break;
    }

    if (opt !== 0) await stop();
  } while (opt !== 0);
};

const detailsPlaceSelected = (place, weather) => {
  console.clear();
  console.log('\nInformación del Lugar\n'.green);
  console.log('Ciudad:', place.desc.green);
  console.log('Lat:', place.lat);
  console.log('Lng:', place.lng);
  console.log('Como está el tiempo:', weather.desc.green);
  console.log('Temperatura:', weather.temperatura, '°C');
  console.log('Mínima:', weather.min, '°C');
  console.log('Máxima:', weather.max, '°C');
};

main();
