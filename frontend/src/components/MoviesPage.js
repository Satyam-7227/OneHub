import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { FaFilm, FaStar, FaCalendarAlt } from 'react-icons/fa';

const MoviesPageContainer = styled.div`
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

const CategoryTabs = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
`;

const CategoryTab = styled.button`
  background: ${props => props.active ? 'rgba(79, 195, 247, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.active ? '#4fc3f7' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active ? '#4fc3f7' : 'white'};
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(79, 195, 247, 0.2);
    border-color: #4fc3f7;
    transform: translateY(-2px);
  }
`;

const MoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const MovieCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const MoviePoster = styled.div`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.poster});
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  margin-bottom: 15px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    border-radius: 0 0 15px 15px;
  }
`;

const MovieTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  line-height: 1.3;
  font-weight: 600;
`;

const MovieDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MovieMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const MovieRating = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #ffd700;
  font-weight: 600;
`;

const MovieDate = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const ViewDetailsButton = styled.a`
  display: inline-block;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 195, 247, 0.3);
  }
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

const PreferencesInfo = styled.div`
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 20px;
  color: #4fc3f7;
  text-align: center;
  font-size: 0.9rem;
`;

function MoviesPage({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('popular');
  const [moviesData, setMoviesData] = useState({
    popular: null,
    upcoming: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [popularRes, upcomingRes] = await Promise.allSettled([
        ApiService.getPopularMovies(),
        ApiService.getUpcomingMovies()
      ]);

      setMoviesData({
        popular: popularRes.status === 'fulfilled' ? popularRes.value : null,
        upcoming: upcomingRes.status === 'fulfilled' ? upcomingRes.value : null
      });
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleRefresh = () => {
    fetchMovies();
  };

  const getCurrentMovies = () => {
    return moviesData[activeCategory];
  };

  const currentMovies = getCurrentMovies();

  return (
    <MoviesPageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>
          <FiArrowLeft />
          Back to Dashboard
        </BackButton>
        <PageTitle>
          <FaFilm />
          Movies
        </PageTitle>
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {currentMovies?.user_genres && currentMovies.user_genres.length > 0 && (
        <PreferencesInfo>
          🎯 Movies filtered by your preferences: {currentMovies.user_genres.join(', ')}
        </PreferencesInfo>
      )}

      <CategoryTabs>
        <CategoryTab 
          active={activeCategory === 'popular'} 
          onClick={() => setActiveCategory('popular')}
        >
          🔥 Popular Movies
        </CategoryTab>
        <CategoryTab 
          active={activeCategory === 'upcoming'} 
          onClick={() => setActiveCategory('upcoming')}
        >
          🎬 Upcoming Movies
        </CategoryTab>
      </CategoryTabs>

      {loading ? (
        <LoadingSpinner>
          <FiRefreshCw className="spinning" />
          Loading {activeCategory} movies...
        </LoadingSpinner>
      ) : currentMovies?.movies ? (
        <MoviesGrid>
          {currentMovies.movies.map((movie, index) => (
            <MovieCard key={movie.id || index}>
              <MoviePoster poster={movie.poster_url} />
              <MovieTitle>{movie.title}</MovieTitle>
              <MovieDescription>
                {movie.description || movie.overview || 'Movie description not available'}
              </MovieDescription>
              <MovieMeta>
                <MovieRating>
                  <FaStar />
                  {movie.rating}/10
                </MovieRating>
                <MovieDate>
                  <FaCalendarAlt />
                  {movie.release_date}
                </MovieDate>
              </MovieMeta>
              <ViewDetailsButton 
                href={`https://www.themoviedb.org/movie/${movie.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Details
              </ViewDetailsButton>
            </MovieCard>
          ))}
        </MoviesGrid>
      ) : (
        <ErrorMessage>
          No {activeCategory} movies available at the moment.
        </ErrorMessage>
      )}
    </MoviesPageContainer>
  );
}

export default MoviesPage;
