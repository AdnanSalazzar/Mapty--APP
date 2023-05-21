'use strict';

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
  click = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; ///[lat , lng]
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  clicks() {
    this.click++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    //min / km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    /* type = 'cycling' */
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
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
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  constructor() {
    ///get local storage
    this._getlocalStorage();

    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    ///this is leaf inbuilt function  to find in the xact location in the map u cant just another addeventlistener then u cant get the whole location of the map

    this.#map.on('click', this._showForm.bind(this));


    ///for local storage the map takes time to render so place it in here 
    this.#workouts.forEach(work => this._renderWorkoutMarker(work));


  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //Emoty the input
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
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
    let workout;

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
      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
    }

    //if workout is cycling , create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validinputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('input have to be positive numbers');
      workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);
    }

    //add new object to workout array

    //Render workout on map as marker
    this._renderWorkoutMarker(workout);

    //Render workout on the list
    this._renderWorkout(workout);

    ///clear input field + hide the form
    this._hideForm();

    /// storing in local Storage
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    console.log(this.#mapEvent);

    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    //using public interface'
    //workout.clicks();
  }

  _setLocalStorage() {
    //key unique for which one u want -- like ID  ,  this is how it works making it into a string an object
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getlocalStorage() {
    ///       converting back tio string
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => this._renderWorkout(work));
  }

  reset(){
    localStorage.removeItem('workouts');
    ///a big object but one of the method is to reload the page 
    location.reload();
  }

}

const app = new App();
///we could write this but no cleaner ... constructtor always runs when a new object is created so put it in there
//app._getPosition();
