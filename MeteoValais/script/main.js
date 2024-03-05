const searchInput = document.getElementById('search');
const searchWrapper = document.querySelector('.wrapper');
const resultsWrapper = document.querySelector('.results');

// getting 6 next hours
var next_6_hour = [];
for (let i_hours = 0; i_hours < 6; i_hours++) {
  const date = new Date();
  hour = (date.getHours() + i_hours)%24
  next_6_hour.push(hour+":00")
}

const date = new Date();
const currentHour = date.getHours();

//default graph data
var rain = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ,0.8];
var temperatures = [1, 2, 3, 4, 5, 6];

//default graf-1 data
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
    label: 'Humidity (mm)',
    data: rain,
    borderWidth: 1,
    borderColor: 'blue',
    backgroundColor: "#0000ff33",
  }],
};
//graf-1 config
const config = {
  type: 'scatter',
  data,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

// creating the graph with settings
const myChart = new Chart(
  document.getElementById('graph'),config
);

//detect if enter is pressed
searchInput.addEventListener("keydown", event => {
  if (event.isComposing || event.keyCode !== 13) {
    return;
  }
  geoCode();
  location.href='#content-2';
  return searchWrapper.classList.remove('show');
});

searchInput.addEventListener('keyup', () => {
  if (event.isComposing || event.keyCode == 13) {
    return;
  }
  else {
    search(searchInput.value);
  }
});



function search(input) {
  async function fetchPrediction() {
    const url = "https://geocoding-api.open-meteo.com/v1/search?name="+input+"&count=100&language=en&format=json";
    var response = await fetch(url);
    var raw_json = await response.json();
    if (raw_json !== "")  {
      var prediciton_relusts = raw_json.results.filter(f => f.country.indexOf('Switzerland') > -1);
    };
    return(prediciton_relusts);
  };

  fetchPrediction().then(api_relust => {
    var results_api = []
    api_relust.forEach( function (element,i_results_api) {
      sugstion = (api_relust[i_results_api].name)+("|")+(api_relust[i_results_api].postcodes[0]);
      results_api.push(sugstion);
    });
    renderResults(results_api);
  });

  if (input.length <3) {
    searchWrapper.classList.remove('show');
  }
  if (input.length > 2) {
    searchWrapper.classList.add('show');
  }
}


function renderResults(results_api) {
  const content = results_api
    .map((item) => {
      return `<li>${item}</li>`;
    })
    .join('');
  resultsWrapper.innerHTML = `<ul>${content}</ul>`;
}

//reload wen changing units
let checkbox = document.getElementById("unit-toggle");
checkbox.addEventListener( "change", () => {
  geoCode();
});

function geoCode() {
  searchWrapper.classList.remove('show');
  
  let input = searchInput.value;
  async function fetchData() {
    const url = "https://geocoding-api.open-meteo.com/v1/search?name="+input+"&count=1&language=en&format=json";
    const response = await fetch(url);
    const datapoints = await response.json();
    return(datapoints);
  }

  fetchData().then(datapoints => {
    const latitude = datapoints.results[0].latitude
    const longitude = datapoints.results[0].longitude;
    
    
    //unit selecter
     
    var default_url = 'https://api.open-meteo.com/v1/forecast?latitude='+latitude+'&longitude='+longitude+'&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,rain&daily=weathercode,uv_index_max,temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=Europe%2FBerlin';
    var url_faraneit ='https://api.open-meteo.com/v1/forecast?latitude='+latitude+'&longitude='+longitude+'&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,rain&daily=weathercode,uv_index_max,temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=Europe%2FBerlin&temperature_unit=fahrenheit';
    
    if (checkbox.checked == true){
      default_url = url_faraneit;
      myChart.data.datasets[0].label = 'Temperatures (F°)';
    }else{
      myChart.data.datasets[0].label = 'Temperatures (C°)';
    };

    async function DataLocation() {
      console.log("url used : ",default_url);
      const response = await fetch(default_url);
      const datapoints_location = await response.json();
      return(datapoints_location);
    };
    
    DataLocation().then(datapoints_location => {
      var Location = datapoints.results[0].name
      var Weathercode = datapoints_location.daily.weathercode
      
      var min_temp = datapoints_location.daily.temperature_2m_min[0];
      var max_temp = datapoints_location.daily.temperature_2m_max[0];
      var temp_unit = datapoints_location.daily_units.temperature_2m_max;

      var UV = datapoints_location.daily.uv_index_max[0]
      var Humidity = datapoints_location.hourly.relativehumidity_2m[currentHour-1]+datapoints_location.hourly_units.relativehumidity_2m;
      var Wind = datapoints_location.hourly.windspeed_10m[currentHour-1]+datapoints_location.hourly_units.windspeed_10m;
      

      //display the info of querry
      document.getElementById("location-selected-temp").innerHTML = (min_temp)+"|"+(max_temp)+(temp_unit);
      document.getElementById("location-selected-name").innerHTML = (Location);
      document.getElementById("uv").innerHTML = ("UV: "+UV);
      document.getElementById("humidity").innerHTML = ("humidity: "+Humidity);
      document.getElementById("wind").innerHTML = ("wind: "+Wind);

      var temperatures = [];
      var rains = []
      //getting next 6hour forcast
      for (let i = 0; i < 6; i++) {
        data_temp = datapoints_location.hourly.temperature_2m[currentHour+(i)];
        temperatures.push(data_temp);

        data_rain = datapoints_location.hourly.rain[currentHour+(i)];
        rains.push(data_rain);
      }
    
      console.log("temp: "+temperatures);
      console.log("rain: "+rain);
      
      myChart.data.datasets[0].data = temperatures;
      myChart.data.datasets[1].data = rains;
      myChart.update();
    })
  })
};