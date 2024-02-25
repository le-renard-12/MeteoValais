async function fetchData_map() {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=46.10,46.23,46.32&longitude=7.07,7.36,7.98&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=Europe%2FBerlin';
    const response = await fetch(url);
    const datapoints_map = await response.json();
    return(datapoints_map);
}

fetchData_map().then(datapoints_map => {
    var min_ht_valais = datapoints_map[0].daily.temperature_2m_min[0];
    var max_ht_valais = datapoints_map[0].daily.temperature_2m_max[0];
    document.getElementById("temp-ht-valais").innerHTML = (min_ht_valais)+"|"+(max_ht_valais);
    
    var min_centre_valais = datapoints_map[1].daily.temperature_2m_min[0];
    var max_centre_valais = datapoints_map[1].daily.temperature_2m_max[0];
    document.getElementById("temp-centre-valais").innerHTML = (min_centre_valais)+"|"+(max_centre_valais);

    var min_bas_valais = datapoints_map[2].daily.temperature_2m_min[0];
    var max_bas_valais = datapoints_map[2].daily.temperature_2m_max[0];
    document.getElementById("temp-bas-valais").innerHTML = (min_bas_valais)+"|"+(max_bas_valais);
});