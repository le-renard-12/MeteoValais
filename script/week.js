const searchParams = new URLSearchParams(window.location.search);


run(searchParams.get('search'));



const date = new Date();
const currentHour = date.getHours();

// getting 6 next hours
var next_6_hour = [];
for (let i_hours = 0; i_hours < 6; i_hours++) {
  hour = (currentHour + i_hours)%24
  next_6_hour.push(hour+":00")
}


// zone graph

//default graph data
var rain = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ,0.8];
var temperatures = [1, 2, 3, 4, 5, 6];

//graf-1 config
let data = {
  labels: next_6_hour,
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

window.addEventListener('resize', function () { dayChart.resize() })

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
  var OpenMeteoApi = "https://api.open-meteo.com/v1/forecast?latitude="+latitude+"&longitude="+longitude+"&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,rain&daily=weathercode,uv_index_max,temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=Europe%2FBerlin";
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
      
      let Location = datapoints.results[0].name;
      let Weathercode = weatherForecast.daily.weathercode;
      let min_temp = weatherForecast.daily.temperature_2m_min[0];
      let max_temp = weatherForecast.daily.temperature_2m_max[0];
      let temp_unit = weatherForecast.daily_units.temperature_2m_max;
      
      document.getElementById("location-selected-temp").innerHTML = (min_temp) +"|"+ (max_temp) + (temp_unit);
      document.getElementById("location-selected-name").innerHTML = (Location);

      var temperatures = [];
      var rains = [];
      for (let i = 0; i < 6; i++) {
        var data_temp = weatherForecast.hourly.temperature_2m[currentHour+(i)];
        temperatures.push(data_temp);
        var data_rain = weatherForecast.hourly.rain[currentHour+(i)];
        rains.push(data_rain);
      }
      
      dayChart.data.datasets[0].data = temperatures;
      dayChart.data.datasets[1].data = rains;
      dayChart.update();
    });
  });
}