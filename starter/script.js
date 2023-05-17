'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

///                                    parameter ==> success func , failure func
navigator.geolocation.getCurrentPosition(
  function (position) {
    console.log(position);
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    console.log(latitude, longitude);

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    ///  <div id="map"></div>  ///ZOOM initial
    const map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    
    ///this is leaf inbuilt function  to find in the xact location in the map u cant just another addeventlistener then u cant get the whole location of the map 
    map.on('click' , function(mapEvent){
      console.log(mapEvent);

      const {lat , lng} = mapEvent.latlng ; 

      L.marker([lat , lng])
      .addTo(map)
      .bindPopup('Clicked')
      .openPopup();

    })  

  },

  function () {
    alert('Could not get the position');
  }
);
