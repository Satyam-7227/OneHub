import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { FaPlay, FaClock, FaUser, FaEye } from 'react-icons/fa';

const VideosPageContainer = styled.div`
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
  flex-wrap: wrap;
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

const VideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const VideoCard = styled.div`
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

const VideoThumbnail = styled.div`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.thumbnail});
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  margin-bottom: 15px;
  position: relative;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
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

const PlayIcon = styled.div`
  position: absolute;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 24px;
  transition: all 0.3s ease;
  
  ${VideoCard}:hover & {
    transform: scale(1.1);
    background: rgba(79, 195, 247, 0.9);
    color: white;
  }
`;

const VideoTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  line-height: 1.3;
  font-weight: 600;
`;

const VideoDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VideoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
`;

const VideoChannel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #4fc3f7;
  font-weight: 600;
  font-size: 0.85rem;
`;

const VideoViews = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const WatchButton = styled.a`
  display: inline-block;
  background: linear-gradient(45deg, #ff4444, #ff6b6b);
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
    box-shadow: 0 10px 20px rgba(255, 68, 68, 0.3);
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

function VideosPage({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [videosData, setVideosData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCategories, setUserCategories] = useState([]);

  const allCategories = [
    { id: 'trending', label: '🔥 Trending', emoji: '🔥' },
    { id: 'technology', label: '💻 Technology', emoji: '💻' },
    { id: 'education', label: '📚 Education', emoji: '📚' },
    { id: 'entertainment', label: '🎬 Entertainment', emoji: '🎬' },
    { id: 'music', label: '🎵 Music', emoji: '🎵' },
    { id: 'gaming', label: '🎮 Gaming', emoji: '🎮' },
    { id: 'sports', label: '⚽ Sports', emoji: '⚽' },
    { id: 'travel', label: '✈️ Travel', emoji: '✈️' },
    { id: 'fitness', label: '💪 Fitness', emoji: '💪' }
  ];

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const videosRes = await ApiService.getVideos(activeCategory);
      console.log(`Videos API Response for ${activeCategory}:`, videosRes);
      setVideosData(videosRes);
      
      // Use user preferences from the videos API response
      if (videosRes && videosRes.user_preferences) {
        console.log('User video preferences from API:', videosRes.user_preferences);
        setUserCategories(videosRes.user_preferences);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [activeCategory]);

  const handleRefresh = () => {
    fetchVideos();
  };

  const formatViews = (views) => {
    if (!views) return 'Unknown views';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  // Filter categories to show only user's preferred categories
  const availableCategories = allCategories.filter(category => 
    userCategories.includes(category.id)
  );

  const filteredVideos = videosData?.videos || [];

  return (
    <VideosPageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>
          <FiArrowLeft />
          Back to Dashboard
        </BackButton>
        <PageTitle>
          <FaPlay />
          Trending Videos
        </PageTitle>
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {videosData?.user_preferences && videosData.user_preferences.length > 0 && (
        <PreferencesInfo>
          🎯 Videos filtered by your preferences: {videosData.user_preferences.join(', ')}
        </PreferencesInfo>
      )}

      <CategoryTabs>
        {availableCategories.map(category => (
          <CategoryTab 
            key={category.id}
            active={activeCategory === category.id} 
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </CategoryTab>
        ))}
      </CategoryTabs>

      {loading ? (
        <LoadingSpinner>
          <FiRefreshCw className="spinning" />
          Loading videos...
        </LoadingSpinner>
      ) : filteredVideos.length > 0 ? (
        <VideosGrid>
          {filteredVideos.map((video, index) => (
            <VideoCard key={`${activeCategory}-${video.id || index}`}>
              <VideoThumbnail thumbnail={video.thumbnail || video.thumbnails?.default?.url}>
                <PlayIcon>
                  <FaPlay />
                </PlayIcon>
              </VideoThumbnail>
              <VideoTitle>{video.title}</VideoTitle>
              <VideoDescription>
                {video.description || 'No description available'}
              </VideoDescription>
              <VideoMeta>
                <VideoChannel>
                  <FaUser />
                  {video.channel || video.channelTitle || 'Unknown Channel'}
                </VideoChannel>
                <VideoViews>
                  <FaEye />
                  {formatViews(video.viewCount || video.views)}
                </VideoViews>
              </VideoMeta>
              <WatchButton 
                href={video.url || `https://youtube.com/watch?v=${video.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FaPlay style={{ marginRight: '5px' }} />
                Watch Video
              </WatchButton>
            </VideoCard>
          ))}
        </VideosGrid>
      ) : (
        <ErrorMessage>
          No {activeCategory} videos available at the moment.
        </ErrorMessage>
      )}
    </VideosPageContainer>
  );
}

export default VideosPage;
