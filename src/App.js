import { Oval } from 'react-loader-spinner'; 
import React, { useState, useEffect } from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; 
import './App.css'; 

function Grp204WeatherApp() {
  const [input, setInput] = useState(''); 
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [forecast, setForecast] = useState([]);
  const [favoriteCities, setFavoriteCities] = useState([]); // State for multiple favorite cities

  // Load favorite cities from localStorage on component mount
  useEffect(() => {
    const savedCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    setFavoriteCities(savedCities);
  }, []);

  // Function to get the current date in French
  const toDateFunction = () => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const weekDays = [
      'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];
    const currentDate = new Date();
    const date = `${weekDays[currentDate.getDay()]} ${currentDate.getDate()} ${
      months[currentDate.getMonth()]
    }`;
    return date;
  };



  

  // Function to fetch weather and forecast for a given city
  const fetchWeather = async (city) => {
    setWeather({ ...weather, loading: true });
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

    try {
      const res = await axios.get(url, {
        params: {
          q: city,
          units: 'metric',
          appid: api_key,
        },
      });
      setWeather({ data: res.data, loading: false, error: false });

      const forecastRes = await axios.get(forecastUrl, {
        params: {
          q: city,
          units: 'metric',
          appid: api_key,
        },
      });
      
      const dailyForecast = forecastRes.data.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast);
    } catch (error) {
      setWeather({ ...weather, data: {}, error: true, loading: false });
    }
  };

  // Function to handle city search
  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchWeather(input);
      setInput(''); // Reset input
    }
  };

  // Function to save favorite city
  const saveFavoriteCity = () => {
    if (weather.data && weather.data.name && !favoriteCities.includes(weather.data.name)) {
      const updatedCities = [...favoriteCities, weather.data.name];
      setFavoriteCities(updatedCities);
      localStorage.setItem('favoriteCities', JSON.stringify(updatedCities)); // Save cities to localStorage
    }
  };

  // Function to remove a favorite city
  const removeFavoriteCity = (city) => {
    const updatedCities = favoriteCities.filter((favCity) => favCity !== city);
    setFavoriteCities(updatedCities);
    localStorage.setItem('favoriteCities', JSON.stringify(updatedCities));
  };

  // Handle click on a favorite city to show its weather
  const handleFavoriteCityClick = (city) => {
    fetchWeather(city);
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
      </div>

      {weather.loading && (
        <Oval color="black" height={100} width={100} />
      )}

      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {weather.data && weather.data.main && (
        <div className='main-one'>
          <h2>{weather.data.name}, {weather.data.sys.country}</h2>
          <span>{toDateFunction()}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description}
          />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>

          <div className="forecast">
        <div className="forecast-container">
          {forecast.map((day, index) => (
            <div className="forecast-day" key={index}>
              <h4>{new Date(day.dt * 1000).toLocaleDateString('fr-FR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}</h4>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt={day.weather[0].description}
              />
              <p>{Math.round(day.main.temp)}°C</p>
            </div>
          ))}
        </div>
      </div>

          {/* Button to save the favorite city */}
          <button onClick={saveFavoriteCity}>Enregistrer comme ville favorite</button>
        </div>
      )}

      

      {/* Display favorite cities and make them clickable */}
      {favoriteCities.length > 0 && (
        <div className='favorites'>
          <h3>Villes favorites :</h3>
          {favoriteCities.map((city, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <span 
                style={{ cursor: 'pointer', color: 'white',background:'grey',marginRight:'-20px', padding:'15px 25px',borderRadius:'10px'}} 
                onClick={() => handleFavoriteCityClick(city)}
              >
                {city}
              </span>
              <button style={{ cursor: 'pointer', color: 'white',background:'#ff7474', padding:'10px 15px',borderRadius:'10px'}} onClick={() => removeFavoriteCity(city)}>Delete</button>
            </div>
          ))}
          
        </div>
      )}

   
    </div>
  );
}

export default Grp204WeatherApp;