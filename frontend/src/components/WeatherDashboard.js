import React, { useState, useEffect } from 'react';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState('London');
    const [searchCity, setSearchCity] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    const fetchWeatherData = async (cityName = city) => {
        if (cityName === city && !isSearching) {
            setLoading(true);
        } else {
            setIsSearching(true);
        }
        setError(null);
        
        // Update the city state immediately when searching to show correct loading text
        if (cityName !== city) {
            setCity(cityName);
        }
        
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:5000/api/weather?city=${encodeURIComponent(cityName)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch weather for ${cityName}`);
            }

            const data = await response.json();
            setWeatherData(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Weather fetch error:', err);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    // Get user's location and preferred city
    const getUserLocation = () => {
        // Check if we're on localhost or HTTP (geolocation requires HTTPS)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isHTTPS = window.location.protocol === 'https:';
        
        if (!isHTTPS && !isLocalhost) {
            setLocationError('Location access requires HTTPS connection');
            setGettingLocation(false);
            return;
        }

        if (navigator.geolocation) {
            setLocationError(null);
            setGettingLocation(true);
            console.log('Attempting to get location...');
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        console.log('✅ Got coordinates:', latitude, longitude);
                        
                        // Use reverse geocoding to get city name
                        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=8ac5c4e57ba6a4b3dfcf622700447b1e`);
                        console.log('Geocoding response status:', response.status);
                        
                        if (response.ok) {
                            const data = await response.json();
                            console.log('Geocoding data:', data);
                            
                            if (data.length > 0) {
                                const userCity = data[0].name;
                                console.log('✅ Found city:', userCity);
                                setCity(userCity);
                                localStorage.setItem('preferred_weather_city', userCity);
                                fetchWeatherData(userCity);
                                setShowLocationPrompt(false);
                                setGettingLocation(false);
                            } else {
                                setLocationError('Could not determine city from location');
                                setLoading(false);
                                setGettingLocation(false);
                            }
                        } else {
                            setLocationError('Failed to get location details from coordinates');
                            setLoading(false);
                            setGettingLocation(false);
                        }
                    } catch (err) {
                        setLocationError('Failed to convert location to city name');
                        setLoading(false);
                        setGettingLocation(false);
                        console.error('❌ Geocoding error:', err);
                    }
                },
                (error) => {
                    console.error('❌ Geolocation error:', error);
                    let errorMessage = 'Location access failed';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = `Location error: ${error.message}`;
                            break;
                    }
                    
                    if (isLocalhost) {
                        errorMessage += ' (Note: Geolocation may not work on localhost in some browsers)';
                    }
                    
                    setLocationError(errorMessage);
                    setGettingLocation(false);
                    
                    // Try IP-based location as fallback
                    console.log('Trying IP-based location fallback...');
                    setTimeout(() => getLocationFromIP(), 1000);
                },
                {
                    enableHighAccuracy: false, // Changed to false for better localhost compatibility
                    timeout: 15000, // Increased timeout
                    maximumAge: 600000 // 10 minutes cache
                }
            );
        } else {
            setLocationError('Geolocation not supported by this browser');
            setGettingLocation(false);
        }
    };

    useEffect(() => {
        // Check if user has a preferred city saved
        const savedCity = localStorage.getItem('preferred_weather_city');
        if (savedCity) {
            setCity(savedCity);
            fetchWeatherData(savedCity);
        } else {
            // Show location prompt for first-time users
            setShowLocationPrompt(true);
            setLoading(false);
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            const newCity = searchCity.trim();
            fetchWeatherData(newCity);
            setSearchCity('');
            // Save as preferred city
            localStorage.setItem('preferred_weather_city', newCity);
        }
    };

    const handleUseCurrentLocation = () => {
        setLoading(true);
        getUserLocation();
    };

    const handleSkipLocation = () => {
        setShowLocationPrompt(false);
        setCity('London');
        localStorage.setItem('preferred_weather_city', 'London');
        fetchWeatherData('London'); // Default to London
    };

    const resetLocationPreference = () => {
        localStorage.removeItem('preferred_weather_city');
        setShowLocationPrompt(true);
        setLoading(false);
        setWeatherData(null);
    };

    // Fallback: Get location from IP address
    const getLocationFromIP = async () => {
        try {
            setGettingLocation(true);
            setLocationError(null);
            console.log('Trying IP-based location detection...');
            
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ IP location data:', data);
                
                if (data.city && data.city !== 'Unknown') {
                    const userCity = data.city;
                    console.log('✅ Found city from IP:', userCity);
                    console.log('Full IP location data:', data);
                    
                    // Try to use more specific location if available
                    let cityToUse = userCity;
                    if (data.region && data.country_name) {
                        console.log(`Region: ${data.region}, Country: ${data.country_name}`);
                        // For better weather API accuracy, try city,country format
                        cityToUse = `${userCity},${data.country_code || data.country_name}`;
                        console.log('Using enhanced city format:', cityToUse);
                    }
                    
                    setCity(userCity); // Display name
                    localStorage.setItem('preferred_weather_city', userCity);
                    fetchWeatherData(cityToUse); // API call with enhanced format
                    setShowLocationPrompt(false);
                    setGettingLocation(false);
                    return true;
                }
            }
            throw new Error('Could not determine location from IP');
        } catch (err) {
            console.error('❌ IP location error:', err);
            setLocationError('Could not detect location automatically. Please search for your city manually.');
            setGettingLocation(false);
            return false;
        }
    };

    const getWeatherIcon = (iconCode) => {
        if (!iconCode) return 'https://openweathermap.org/img/wn/01d@2x.png';
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    const formatTemperature = (temp) => {
        return Math.round(temp || 0);
    };

    // Location prompt for first-time users
    if (showLocationPrompt) {
        return (
            <div className="weather-dashboard">
                <div className="weather-header">
                    <h1>Weather Dashboard</h1>
                </div>
                <div className="location-prompt">
                    <div className="prompt-card">
                        <h3>🌍 Get Weather for Your Location</h3>
                        <p>Would you like to use your current location for weather updates?</p>
                        {locationError && <p className="error-text">{locationError}</p>}
                        <div className="prompt-buttons">
                            <button 
                                onClick={getLocationFromIP} 
                                className="location-btn primary"
                                disabled={gettingLocation}
                            >
                                {gettingLocation ? '🔄 Detecting...' : '🌐 Auto-Detect My City'}
                            </button>
                            <button 
                                onClick={handleSkipLocation} 
                                className="location-btn secondary"
                                disabled={gettingLocation}
                            >
                                Skip (Use London)
                            </button>
                        </div>
                        <p className="privacy-note">
                            Your location is only used to get weather data and is not stored.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="weather-dashboard">
                <div className="weather-header">
                    <h1>Weather Dashboard</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading weather data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="weather-dashboard">
                <div className="weather-header">
                    <h1>Weather Dashboard</h1>
                </div>
                <div className="error-container">
                    <p className="error-message">Error: {error}</p>
                    <button onClick={() => fetchWeatherData()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="weather-dashboard">
            <div className="weather-header">
                <h1>Weather Dashboard</h1>
                <div className="header-controls">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Enter city name..."
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="city-input"
                        />
                        <button type="submit" className="search-btn">Search</button>
                    </form>
                    <button onClick={resetLocationPreference} className="reset-location-btn">
                        🔄 Change Location
                    </button>
                </div>
            </div>

            {isSearching && (
                <div className="search-loading">
                    <div className="loading-spinner small"></div>
                    <p>Searching for {city}...</p>
                </div>
            )}

            {weatherData && !isSearching && (
                <>
                    <div className="current-weather">
                        <div className="current-info">
                            <div className="location">
                                <h2>{weatherData.city}{weatherData.country && `, ${weatherData.country}`}</h2>
                                {weatherData.is_mock && <span className="mock-badge">Demo Data</span>}
                                {!weatherData.is_mock && <span className="live-badge">Live Data</span>}
                            </div>
                            <div className="temperature">
                                <span className="temp-value">{formatTemperature(weatherData.temperature)}°C</span>
                                <img 
                                    src={getWeatherIcon(weatherData.icon)} 
                                    alt={weatherData.description}
                                    className="weather-icon"
                                />
                            </div>
                        </div>
                        <div className="weather-details">
                            <p className="description">{weatherData.description}</p>
                            {weatherData.feels_like && (
                                <p className="feels-like">Feels like {formatTemperature(weatherData.feels_like)}°C</p>
                            )}
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="label">Humidity</span>
                                    <span className="value">{weatherData.humidity}%</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Wind Speed</span>
                                    <span className="value">{weatherData.wind_speed} km/h</span>
                                </div>
                                {weatherData.pressure && (
                                    <div className="detail-item">
                                        <span className="label">Pressure</span>
                                        <span className="value">{weatherData.pressure} hPa</span>
                                    </div>
                                )}
                                {weatherData.visibility && (
                                    <div className="detail-item">
                                        <span className="label">Visibility</span>
                                        <span className="value">{weatherData.visibility} km</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {weatherData.forecast && weatherData.forecast.length > 0 && (
                        <div className="forecast-section">
                            <h3>5-Day Forecast</h3>
                            <div className="forecast-grid">
                                {weatherData.forecast.map((day, index) => (
                                    <div key={index} className="forecast-card">
                                        <div className="forecast-day">{day.day}</div>
                                        <img 
                                            src={getWeatherIcon(day.icon)} 
                                            alt={day.description}
                                            className="forecast-icon"
                                        />
                                        <div className="forecast-temps">
                                            <span className="high">{formatTemperature(day.high)}°</span>
                                            <span className="low">{formatTemperature(day.low)}°</span>
                                        </div>
                                        <div className="forecast-desc">{day.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WeatherDashboard;
