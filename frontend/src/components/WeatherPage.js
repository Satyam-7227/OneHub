import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiArrowLeft, FiMapPin } from 'react-icons/fi';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiWindy } from 'react-icons/wi';

const WeatherPageContainer = styled.div`
  color: white;
  min-height: 100vh;
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const SearchSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const SearchInput = styled.input`
  padding: 12px 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  width: 300px;
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    border-color: #4fc3f7;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SearchButton = styled.button`
  padding: 12px 25px;
  background: #4299e1;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  &:hover {
    background: #3182ce;
    transform: translateY(-1px);
  }
`;

const ChangeLocationButton = styled.button`
  padding: 12px 20px;
  background: rgba(79, 195, 247, 0.2);
  border: 2px solid rgba(79, 195, 247, 0.5);
  border-radius: 25px;
  color: #4fc3f7;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(79, 195, 247, 0.3);
    transform: translateY(-2px);
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(79, 195, 247, 0.2);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 25px;
  color: #4fc3f7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(79, 195, 247, 0.3);
    transform: translateY(-2px);
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 20px;
`;

const WeatherCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const CityName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #4fc3f7;
`;

const Temperature = styled.div`
  font-size: 3rem;
  font-weight: bold;
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const WeatherIcon = styled.div`
  font-size: 4rem;
  color: #87CEEB;
`;

const WeatherDescription = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  text-transform: capitalize;
`;

const WeatherDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  text-align: center;
`;

const DetailLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 18px;
  flex-direction: column;
  gap: 15px;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  color: #ff6b6b;
  text-align: center;
`;

const ForecastSection = styled.div`
  margin-top: 30px;
`;

const ForecastTitle = styled.h2`
  color: white;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const ForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const ForecastCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ForecastDay = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  color: #4fc3f7;
`;

const ForecastTemp = styled.div`
  font-size: 1.2rem;
  margin: 10px 0;
`;

const ForecastDesc = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: capitalize;
`;

const LocationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LocationModalContent = styled.div`
  background: #2d3748;
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const LocationModalTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const LocationModalText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
`;

const LocationButtonsContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const AutoDetectButton = styled.button`
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const SkipButton = styled.button`
  padding: 15px 25px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateY(-2px);
  }
`;

const LocationDisclaimer = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  margin: 0;
`;

function WeatherPage({ onBack }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [currentCity, setCurrentCity] = useState('London');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'clear': <WiDaySunny />,
      'sunny': <WiDaySunny />,
      'cloudy': <WiCloudy />,
      'overcast': <WiCloudy />,
      'rain': <WiRain />,
      'rainy': <WiRain />,
      'snow': <WiSnow />,
      'snowy': <WiSnow />,
      'thunderstorm': <WiThunderstorm />,
      'windy': <WiWindy />
    };
    
    const lowerCondition = condition.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerCondition.includes(key)) {
        return icon;
      }
    }
    return <WiDaySunny />;
  };

  const fetchWeather = async (city = currentCity) => {
    try {
      setLoading(true);
      setError(null);
      const weatherRes = await ApiService.getWeather(city);
      console.log('Weather API Response:', weatherRes);
      setWeatherData(weatherRes);
      setCurrentCity(city);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError(`Failed to load weather data for ${city}. Please check if you are logged in or try a different city.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchCity.trim()) {
      const newCity = searchCity.trim();
      fetchWeather(newCity);
      setSearchCity('');
      // Save as preferred city
      localStorage.setItem('preferred_weather_city', newCity);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChangeLocation = () => {
    // Reset location preference to show the modal again
    localStorage.removeItem('preferred_weather_city');
    setShowLocationModal(true);
    setWeatherData(null);
  };

  const handleAutoDetectLocation = async () => {
    setLocationPermissionAsked(true);
    setLoading(true);
    
    try {
      console.log('Trying IP-based location detection...');
      
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ IP location data:', data);
        
        if (data.city && data.city !== 'Unknown') {
          const userCity = data.city;
          console.log('✅ Found city from IP:', userCity);
          
          // Try to use more specific location if available
          let cityToUse = userCity;
          if (data.region && data.country_name) {
            console.log(`Region: ${data.region}, Country: ${data.country_name}`);
            // For better weather API accuracy, try city,country format
            cityToUse = `${userCity},${data.country_code || data.country_name}`;
            console.log('Using enhanced city format:', cityToUse);
          }
          
          setCurrentCity(userCity); // Display name
          localStorage.setItem('preferred_weather_city', userCity);
          fetchWeather(cityToUse); // API call with enhanced format
          setShowLocationModal(false);
          return;
        }
      }
      throw new Error('Could not determine location from IP');
    } catch (error) {
      console.error('❌ IP location error:', error);
      setError('Could not detect location automatically. Using London as default.');
      fetchWeather('London');
      setShowLocationModal(false);
    }
  };

  const handleSkipLocation = () => {
    setShowLocationModal(false);
    localStorage.setItem('preferred_weather_city', 'London');
    fetchWeather('London');
  };

  useEffect(() => {
    // Check if user has a preferred city saved
    const savedCity = localStorage.getItem('preferred_weather_city');
    if (savedCity) {
      setCurrentCity(savedCity);
      setShowLocationModal(false);
      fetchWeather(savedCity);
    } else {
      // Show location prompt for first-time users
      setShowLocationModal(true);
    }
  }, []);

  const handleRefresh = () => {
    fetchWeather();
  };

  // Show location modal first
  if (showLocationModal) {
    return (
      <WeatherPageContainer>
        <LocationModal>
          <LocationModalContent>
            <LocationModalTitle>
              🌍 Get Weather for Your Location
            </LocationModalTitle>
            <LocationModalText>
              Would you like to use your current location for weather updates?
            </LocationModalText>
            <LocationButtonsContainer>
              <AutoDetectButton onClick={handleAutoDetectLocation}>
                🌐 Auto-Detect My City
              </AutoDetectButton>
              <SkipButton onClick={handleSkipLocation}>
                Skip (Use London)
              </SkipButton>
            </LocationButtonsContainer>
            <LocationDisclaimer>
              Your location is only used to get weather data and is not stored.
            </LocationDisclaimer>
          </LocationModalContent>
        </LocationModal>
      </WeatherPageContainer>
    );
  }

  if (loading) {
    return (
      <WeatherPageContainer>
        <PageHeader>
          <BackButton onClick={onBack}>
            <FiArrowLeft /> Back to Dashboard
          </BackButton>
          <PageTitle>🌤️ Weather Dashboard</PageTitle>
          <div></div>
        </PageHeader>
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Enter city name..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <SearchButton onClick={handleSearch} disabled={loading}>
            Search
          </SearchButton>
          <ChangeLocationButton onClick={handleChangeLocation} disabled={loading}>
            <FiMapPin /> Change Location
          </ChangeLocationButton>
        </SearchSection>
        <LoadingSpinner>
          <FiRefreshCw className="spinning" />
          Loading weather data...
        </LoadingSpinner>
      </WeatherPageContainer>
    );
  }

  if (error) {
    return (
      <WeatherPageContainer>
        <PageHeader>
          <BackButton onClick={onBack}>
            <FiArrowLeft /> Back to Dashboard
          </BackButton>
          <PageTitle>🌤️ Weather Dashboard</PageTitle>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw /> Retry
          </RefreshButton>
        </PageHeader>
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Enter city name..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <SearchButton onClick={handleSearch}>
            Search
          </SearchButton>
          <ChangeLocationButton onClick={handleChangeLocation}>
            <FiMapPin /> Change Location
          </ChangeLocationButton>
        </SearchSection>
        <ErrorMessage>{error}</ErrorMessage>
      </WeatherPageContainer>
    );
  }

  return (
    <WeatherPageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>
          <FiArrowLeft /> Back to Dashboard
        </BackButton>
        <PageTitle>🌤️ Weather Dashboard</PageTitle>
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw /> Refresh
        </RefreshButton>
      </PageHeader>

      <SearchSection>
        <SearchInput
          type="text"
          placeholder="Enter city name..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton onClick={handleSearch}>
          Search
        </SearchButton>
        <ChangeLocationButton onClick={handleChangeLocation}>
          <FiMapPin /> Change Location
        </ChangeLocationButton>
      </SearchSection>

      {weatherData && (
        <WeatherGrid>
          <WeatherCard>
            <CityName>
              <FiMapPin />
              {weatherData.city}
            </CityName>
            <Temperature>
              <WeatherIcon>
                {getWeatherIcon(weatherData.description)}
              </WeatherIcon>
              {weatherData.temperature}°C
            </Temperature>
            <WeatherDescription>
              {weatherData.description}
            </WeatherDescription>
            <WeatherDetails>
              <DetailItem>
                <DetailLabel>Humidity</DetailLabel>
                <DetailValue>{weatherData.humidity}%</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Wind Speed</DetailLabel>
                <DetailValue>{weatherData.wind_speed} km/h</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Feels Like</DetailLabel>
                <DetailValue>{weatherData.feels_like}°C</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Pressure</DetailLabel>
                <DetailValue>{weatherData.pressure} hPa</DetailValue>
              </DetailItem>
            </WeatherDetails>
          </WeatherCard>
        </WeatherGrid>
      )}

      {weatherData?.forecast && (
        <ForecastSection>
          <ForecastTitle>5-Day Forecast</ForecastTitle>
          <ForecastGrid>
            {weatherData.forecast.map((day, index) => (
              <ForecastCard key={index}>
                <ForecastDay>{day.day}</ForecastDay>
                <WeatherIcon>
                  {getWeatherIcon(day.description)}
                </WeatherIcon>
                <ForecastTemp>{day.high}° / {day.low}°</ForecastTemp>
                <ForecastDesc>{day.description}</ForecastDesc>
              </ForecastCard>
            ))}
          </ForecastGrid>
        </ForecastSection>
      )}
    </WeatherPageContainer>
  );
}

export default WeatherPage;
