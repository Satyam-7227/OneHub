import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';
import { FaNewspaper, FaBriefcase, FaPlay, FaFilm, FaRedditAlien, FaUtensils } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import MoviesPage from './MoviesPage';
import NewsPage from './NewsPage';
import VideosPage from './VideosPage';
import RedditPage from './RedditPage';
import WeatherPage from './WeatherPage';
import CryptoPage from './CryptoPage';
import RecipesPage from './RecipesPage';

const DashboardContainer = styled.div`
  color: white;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const WelcomeText = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const RefreshButton = styled.button`
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

const SettingsButton = styled(RefreshButton)`
  background: rgba(255, 255, 255, 0.15);
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const SectionCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
`;

const ContentList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-top: 15px;
`;

const ContentItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const ItemTitle = styled.h4`
  color: white;
  font-size: 1rem;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const ItemDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const ItemLink = styled.a`
  color: #4fc3f7;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #29b6f6;
    text-decoration: underline;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ItemCount = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ClickableCard = styled.div`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
  color: #ff6b6b;
`;

function Dashboard({ user, onLogout }) {
  const [data, setData] = useState({
    news: null,
    jobs: null,
    videos: null,
    deals: null,
    reddit: null,
    movies: null,
    upcomingMovies: null,
    food: null,
    recommendations: null,
    nfts: null,
    weather: null,
    crypto: null,
    recipes: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showMoviesPage, setShowMoviesPage] = useState(false);
  const [showNewsPage, setShowNewsPage] = useState(false);
  const [showVideosPage, setShowVideosPage] = useState(false);
  const [showRedditPage, setShowRedditPage] = useState(false);
  const [showWeatherPage, setShowWeatherPage] = useState(false);
  const [showCryptoPage, setShowCryptoPage] = useState(false);
  const [showRecipesPage, setShowRecipesPage] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [jobsRes, recommendationsRes, weatherRes, cryptoRes, recipesRes] = await Promise.allSettled([
        ApiService.getJobs(),
        ApiService.getRecommendations(user?.id || 'default_user'),
        ApiService.getWeather(),
        ApiService.getCrypto(),
        ApiService.getRecipes()
      ]);

      setData({
        news: null,
        jobs: jobsRes.status === 'fulfilled' ? jobsRes.value : null,
        videos: null,
        reddit: null,
        recommendations: recommendationsRes.status === 'fulfilled' ? recommendationsRes.value : null,
        movies: null,
        upcomingMovies: null,
        deals: null,
        food: null,
        nfts: null,
        weather: weatherRes.status === 'fulfilled' ? weatherRes.value : null,
        crypto: cryptoRes.status === 'fulfilled' ? cryptoRes.value : null,
        recipes: recipesRes.status === 'fulfilled' ? recipesRes.value : null
      });

      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchData();
  };

  const handleMoviesClick = () => {
    setShowMoviesPage(true);
  };

  const handleNewsClick = () => {
    setShowNewsPage(true);
  };

  const handleVideosClick = () => {
    setShowVideosPage(true);
  };

  const handleRedditClick = () => {
    setShowRedditPage(true);
  };

  const handleWeatherClick = () => {
    setShowWeatherPage(true);
  };

  const handleCryptoClick = () => {
    setShowCryptoPage(true);
  };

  const handleRecipesClick = () => {
    setShowRecipesPage(true);
  };

  const handleBackToDashboard = () => {
    setShowMoviesPage(false);
    setShowNewsPage(false);
    setShowVideosPage(false);
    setShowRedditPage(false);
    setShowWeatherPage(false);
    setShowCryptoPage(false);
    setShowRecipesPage(false);
  };

  // Removed unused handleUserAction function

  if (showMoviesPage) {
    return <MoviesPage onBack={handleBackToDashboard} />;
  }

  if (showNewsPage) {
    return <NewsPage onBack={handleBackToDashboard} />;
  }

  if (showVideosPage) {
    return <VideosPage onBack={handleBackToDashboard} />;
  }

  if (showRedditPage) {
    return <RedditPage onBack={handleBackToDashboard} />;
  }

  if (showWeatherPage) {
    return <WeatherPage onBack={handleBackToDashboard} />;
  }

  if (showCryptoPage) {
    return <CryptoPage onBack={handleBackToDashboard} />;
  }

  if (showRecipesPage) {
    return <RecipesPage onBack={handleBackToDashboard} />;
  }

  if (loading && !data.news) {
    return (
      <DashboardContainer>
        <LoadingSpinner>
          <FiRefreshCw className="spinning" />
          Loading your personalized dashboard...
        </LoadingSpinner>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <GridContainer>
        <ClickableCard onClick={handleNewsClick}>
          <SectionCard>
            <SectionHeader>
              <SectionTitle><FaNewspaper /> News</SectionTitle>
              <ItemCount>Click to explore</ItemCount>
            </SectionHeader>
            <ContentList>
              <ContentItem>
                <ItemTitle>📰 Latest News</ItemTitle>
                <ItemDescription>
                  Stay updated with the latest news across various categories including technology, business, health, and more. 
                  Click here to explore personalized news articles.
                </ItemDescription>
                <ItemMeta>
                  <span>Technology • Business • Health • Sports</span>
                  <ItemLink as="span" style={{ cursor: 'pointer' }}>
                    Read News →
                  </ItemLink>
                </ItemMeta>
              </ContentItem>
            </ContentList>
          </SectionCard>
        </ClickableCard>

        <SectionCard>
          <SectionHeader>
            <SectionTitle><FaBriefcase /> Job Opportunities</SectionTitle>
            {data.jobs?.jobs && <ItemCount>{data.jobs.jobs.length} jobs</ItemCount>}
          </SectionHeader>
          {loading ? (
            <LoadingSpinner>Loading jobs...</LoadingSpinner>
          ) : data.jobs?.jobs ? (
            <ContentList>
              {data.jobs.jobs.map((job, index) => (
                <ContentItem key={index}>
                  <ItemTitle>{job.title}</ItemTitle>
                  <ItemDescription>{job.description || job.company || 'Job opportunity available'}</ItemDescription>
                  <ItemMeta>
                    <span>{job.company || job.location || 'Various Companies'}</span>
                    <ItemLink href={job.redirect_url || job.url || '#'} target="_blank" rel="noopener noreferrer">
                      Apply Now →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              ))}
            </ContentList>
          ) : (
            <p>No job data available</p>
          )}
        </SectionCard>

        <ClickableCard onClick={handleVideosClick}>
          <SectionCard>
            <SectionHeader>
              <SectionTitle><FaPlay /> Trending Videos</SectionTitle>
              <ItemCount>Click to explore</ItemCount>
            </SectionHeader>
            <ContentList>
              <ContentItem>
                <ItemTitle>📺 Trending Videos</ItemTitle>
                <ItemDescription>
                  Discover trending videos across various categories including technology, education, entertainment, and more. 
                  Click here to explore personalized video content.
                </ItemDescription>
                <ItemMeta>
                  <span>Technology • Education • Entertainment • Gaming</span>
                  <ItemLink as="span" style={{ cursor: 'pointer' }}>
                    Watch Videos →
                  </ItemLink>
                </ItemMeta>
              </ContentItem>
            </ContentList>
          </SectionCard>
        </ClickableCard>

        <ClickableCard onClick={handleMoviesClick}>
          <SectionCard>
            <SectionHeader>
              <SectionTitle><FaFilm /> Movies</SectionTitle>
              <ItemCount>Click to explore</ItemCount>
            </SectionHeader>
            <ContentList>
              <ContentItem>
                <ItemTitle>🎬 Discover Movies</ItemTitle>
                <ItemDescription>
                  Explore popular and upcoming movies filtered by your preferences. 
                  Click here to view the full movies collection with detailed information.
                </ItemDescription>
                <ItemMeta>
                  <span>Popular • Upcoming • Personalized</span>
                  <ItemLink as="span" style={{ cursor: 'pointer' }}>
                    Open Movies →
                  </ItemLink>
                </ItemMeta>
              </ContentItem>
            </ContentList>
          </SectionCard>
        </ClickableCard>

        <ClickableCard onClick={handleRedditClick}>
          <SectionCard>
            <SectionHeader>
              <SectionTitle><FaRedditAlien /> Reddit Posts</SectionTitle>
              <ItemCount>Click to explore</ItemCount>
            </SectionHeader>
            <ContentList>
              <ContentItem>
                <ItemTitle>🔥 Hot Reddit Posts</ItemTitle>
                <ItemDescription>
                  Explore trending discussions from your favorite subreddits including technology, programming, science, and more. 
                  Click here to browse personalized Reddit content.
                </ItemDescription>
                <ItemMeta>
                  <span>r/Technology • r/Programming • r/Science • r/Gaming</span>
                  <ItemLink as="span" style={{ cursor: 'pointer' }}>
                    Browse Reddit →
                  </ItemLink>
                </ItemMeta>
              </ContentItem>
            </ContentList>
          </SectionCard>
        </ClickableCard>

        <ClickableCard onClick={handleWeatherClick}>
          <SectionCard>
            <SectionHeader>
              <SectionTitle>🌤️ Weather</SectionTitle>
              {data.weather && <ItemCount>{data.weather.city || 'Weather data'}</ItemCount>}
            </SectionHeader>
            {loading ? (
              <LoadingSpinner>Loading weather...</LoadingSpinner>
            ) : data.weather ? (
              <ContentList>
                <ContentItem>
                  <ItemTitle>🌡️ {data.weather.temperature}°C - {data.weather.description}</ItemTitle>
                  <ItemDescription>
                    Current conditions in {data.weather.city}: {data.weather.description}. 
                    Feels like {data.weather.feels_like}°C, humidity {data.weather.humidity}%.
                  </ItemDescription>
                  <ItemMeta>
                    <span>Wind: {data.weather.wind_speed} km/h • Pressure: {data.weather.pressure} hPa</span>
                    <ItemLink as="span" style={{ cursor: 'pointer' }}>
                      View Details →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
                {data.weather.forecast && data.weather.forecast.slice(0, 2).map((day, index) => (
                  <ContentItem key={index}>
                    <ItemTitle>{day.day}: {day.high}°/{day.low}°C</ItemTitle>
                    <ItemDescription>{day.description}</ItemDescription>
                  </ContentItem>
                ))}
              </ContentList>
            ) : (
              <ContentList>
                <ContentItem>
                  <ItemTitle>☀️ Weather Forecast</ItemTitle>
                  <ItemDescription>
                    Get current weather conditions and forecasts for your location and favorite cities.
                  </ItemDescription>
                  <ItemMeta>
                    <span>Current • Forecast • Alerts • Multiple Cities</span>
                    <ItemLink as="span" style={{ cursor: 'pointer' }}>
                      View Weather →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              </ContentList>
            )}
          </SectionCard>
        </ClickableCard>

        <ClickableCard onClick={handleCryptoClick}>
          <SectionCard>
            <SectionHeader>
              <SectionTitle>₿ Crypto</SectionTitle>
              {data.crypto?.cryptocurrencies && <ItemCount>{data.crypto.cryptocurrencies.length} coins</ItemCount>}
            </SectionHeader>
            {loading ? (
              <LoadingSpinner>Loading crypto...</LoadingSpinner>
            ) : data.crypto?.cryptocurrencies ? (
              <ContentList>
                {data.crypto.cryptocurrencies.slice(0, 3).map((coin, index) => (
                  <ContentItem key={index}>
                    <ItemTitle>
                      {coin.symbol} ${coin.price?.toLocaleString() || 'N/A'} 
                      <span style={{ color: coin.change_24h >= 0 ? '#4caf50' : '#f44336', marginLeft: '8px' }}>
                        {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2) || '0'}%
                      </span>
                    </ItemTitle>
                    <ItemDescription>
                      {coin.name} - Market Cap: ${(coin.market_cap / 1000000000).toFixed(1)}B
                    </ItemDescription>
                    <ItemMeta>
                      <span>Rank #{coin.rank} • Volume: ${(coin.volume / 1000000).toFixed(0)}M</span>
                      <ItemLink as="span" style={{ cursor: 'pointer' }}>
                        View Details →
                      </ItemLink>
                    </ItemMeta>
                  </ContentItem>
                ))}
              </ContentList>
            ) : (
              <ContentList>
                <ContentItem>
                  <ItemTitle>📈 Cryptocurrency Prices</ItemTitle>
                  <ItemDescription>
                    Track real-time cryptocurrency prices, market trends, and portfolio performance. 
                    Click here to explore crypto markets and your favorite coins.
                  </ItemDescription>
                  <ItemMeta>
                    <span>Bitcoin • Ethereum • Altcoins • Market Trends</span>
                    <ItemLink as="span" style={{ cursor: 'pointer' }}>
                      View Crypto →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              </ContentList>
            )}
          </SectionCard>
        </ClickableCard>

        <ClickableCard onClick={handleRecipesClick}>
          <SectionCard>
            <SectionHeader>
              <SectionTitle><FaUtensils /> Recipes</SectionTitle>
              {data.recipes?.recipes && <ItemCount>{data.recipes.recipes.length} recipes</ItemCount>}
            </SectionHeader>
            {loading ? (
              <LoadingSpinner>Loading recipes...</LoadingSpinner>
            ) : data.recipes?.recipes ? (
              <ContentList>
                {data.recipes.recipes.slice(0, 3).map((recipe, index) => (
                  <ContentItem key={index}>
                    <ItemTitle>🍽️ {recipe.title || recipe.name || 'Delicious Recipe'}</ItemTitle>
                    <ItemDescription>
                      {recipe.description || recipe.summary || 'A wonderful recipe with amazing flavors.'}
                    </ItemDescription>
                    <ItemMeta>
                      <span>⏱️ {recipe.cook_time || recipe.ready_in_minutes || '30'} min • 👥 {recipe.servings || '4'} servings</span>
                      <ItemLink as="span" style={{ cursor: 'pointer' }}>
                        View Recipe →
                      </ItemLink>
                    </ItemMeta>
                  </ContentItem>
                ))}
              </ContentList>
            ) : (
              <ContentList>
                <ContentItem>
                  <ItemTitle>🍳 Discover Recipes</ItemTitle>
                  <ItemDescription>
                    Explore delicious recipes from various cuisines and dietary preferences. 
                    Find breakfast, lunch, dinner, and dessert recipes tailored to your taste.
                  </ItemDescription>
                  <ItemMeta>
                    <span>Breakfast • Lunch • Dinner • Dessert • Healthy</span>
                    <ItemLink as="span" style={{ cursor: 'pointer' }}>
                      Browse Recipes →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              </ContentList>
            )}
          </SectionCard>
        </ClickableCard>

        <SectionCard>
          <SectionHeader>
            <SectionTitle>🎯 Personalized Recommendations</SectionTitle>
            {data.recommendations?.recommendations && <ItemCount>{data.recommendations.recommendations.length} items</ItemCount>}
          </SectionHeader>
          {loading ? (
            <LoadingSpinner>Loading recommendations...</LoadingSpinner>
          ) : data.recommendations?.recommendations ? (
            <ContentList>
              {data.recommendations.recommendations.map((rec, index) => (
                <ContentItem key={index}>
                  <ItemTitle>{rec.title}</ItemTitle>
                  <ItemDescription>{rec.description || rec.reason || 'Recommended for you based on your interests'}</ItemDescription>
                  <ItemMeta>
                    <span>{rec.category || rec.type || 'Recommendation'}</span>
                    <ItemLink href={rec.url || rec.link || '#'} target="_blank" rel="noopener noreferrer">
                      Explore →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              ))}
            </ContentList>
          ) : (
            <p>No recommendations available</p>
          )}
        </SectionCard>
      </GridContainer>

      <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </DashboardContainer>
  );
}

export default Dashboard;
