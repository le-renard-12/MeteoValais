const searchParams = new URLSearchParams(window.location.search);
const unitCheckbox = document.getElementById("unit-toggle");
const city =searchParams.get('search');
const resultsGrid = document.querySelector(".grid-container")

run(city);


function getNextSevenDays() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const nextSevenDays = [];

  for (let i = 0; i < 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      nextSevenDays.push(daysOfWeek[nextDay.getDay()]);
  }
  return nextSevenDays;
}

const nextSevenDaysNames = getNextSevenDays();

// zone graph

//default graph data
var rain = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ,0.8];
var temperatures = [1, 2, 3, 4, 5, 6];

//graf-1 config
let data = {
  labels: nextSevenDaysNames,
  datasets: [{
    type: "line",
    label: 'Temperatures (C°)',
    data: temperatures,
    borderWidth: 1,
    borderColor: 'red',
  },
  {
    type: "bar",
    label: 'Rain (mm)',
    data: rain,
    borderWidth: 1,
    borderColor: 'blue',
    backgroundColor: "#0000ff33",
  }],
};

const config = {
  type: 'scatter',
  data,
  options: {
    tension:0.4,
    maintainAspectRatio:false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

const dayChart = new Chart(
  document.getElementById('graph'),config
);

window.addEventListener('resize', function () { dayChart.resize() });

// end



//update graph when changing units
//let unitCheckbox = document.getElementById("unit-toggle");
//unitCheckbox.addEventListener( "change", () => {
//  run(document.getElementById('search').value);
//});


async function geocode(input) {
  const geocodingApi = "https://geocoding-api.open-meteo.com/v1/search?name="+input+"&count=1&language=en&format=json";
  const response = await fetch(geocodingApi);
  const datapoints = await response.json();
  return datapoints;
}

async function getLocationForcast(default_url) {
  console.log("Geocodig url used : ",default_url);
  const response = await fetch(default_url);
  const datapoints_location = await response.json();
  return datapoints_location;
}

function updateTemperatureUnit(latitude, longitude) {

  var OpenMeteoApi = "https://api.open-meteo.com/v1/forecast?latitude="+latitude+"&longitude="+longitude+"&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin";
  dayChart.data.datasets[0].label = 'Temperatures (C°)';

  //if (unitCheckbox.checked){
  //  OpenMeteoApi += "&temperature_unit=fahrenheit";
  //  dayChart.data.datasets[0].label = 'Temperatures (F°)';
  //}

  return OpenMeteoApi;
}

function run(input) {

  geocode(input).then(datapoints => {
    const latitude = datapoints.results[0].latitude;
    const longitude = datapoints.results[0].longitude;
    
    var OpenMeteoApi = updateTemperatureUnit(latitude, longitude);

    getLocationForcast(OpenMeteoApi).then(weatherForecast => {
      
      let valuesOfDays = []
      for (let i = 0; i < 7; i++){
        let tempMin = weatherForecast.daily.temperature_2m_min[i];
        let tempMax = weatherForecast.daily.temperature_2m_max[i];
        let weather_code = weatherForecast.daily.weather_code[i]
        var values= [tempMin,tempMax,weather_code]
        valuesOfDays.push(values)
      }
      display(valuesOfDays)
    });
  });
}



function display(valuesOfDays) {
  let contents = resultsGrid.innerHTML;
  for (let i = 0; i < valuesOfDays.length; i++) {
    console.log(valuesOfDays[i]);
    // [min,max,code]
    let tempMin = valuesOfDays[i][0];
    let tempMax = valuesOfDays[i][1];
    let weatherCode = valuesOfDays[i][2];
    let day = nextSevenDaysNames[i]
    
    contents += `<div class="grid-item grid-item-${i+1}">
      <span>${day}</span>
      <img src="picture/svg/pictogram/weather-icons-${weatherCode}-svgrepo-com.svg">
      <span>${tempMin}|${tempMax}</span>
    </div>`;

    
  }
  resultsGrid.innerHTML = contents
}