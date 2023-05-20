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

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; ///[lat , lng]
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    //min / km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed;
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed();
  }
}
/* 
const run1 = new Running([39 , -12] , 5.2 , 24 , 178);
const cycle1 = new Cycling([39 , -12] , 27 , 29 , 523);
console.log(run1 , cycle1); 
*/

///////////////////////////////
/////////APP archetecture
class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    ///                                    parameter ==> success func , failure func
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('Could not get the position');
      }
    );
  }

  _loadMap(position) {
    console.log(position);
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    console.log(latitude, longitude);

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    ///  <div id="map"></div>  ///ZOOM initial
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    ///this is leaf inbuilt function  to find in the xact location in the map u cant just another addeventlistener then u cant get the whole location of the map

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    ///               passes array --->    check all the element if positive else return false
    const validinputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    //get data from Form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value; 
    const { lat, lng } = this.#mapEvent.latlng;
    

    //Check data if valid

    //if workout is running , create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      ///check if data is valid
      if (
        /*  !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(cadence) */
        !validinputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('input have to be positive numbers');

        ///now doing the job 
        const workout = new Running([lat, lng] , distance , duration, cadence)


    }

    //if workout is cycling , create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validinputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('input have to be positive numbers');
    }

    //add new object to workout array

    //Render workout on map as marker
    console.log(this.#mapEvent);
   
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();

    //Render workout on the list

    ///clear input field + hide the form

    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
}

const app = new App();
///we could write this but no cleaner ... constructtor always runs when a new object is created so put it in there
//app._getPosition();
