import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { FaNewspaper, FaClock, FaUser } from 'react-icons/fa';

const NewsPageContainer = styled.div`
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

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const NewsCard = styled.div`
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

const NewsImage = styled.div`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  margin-bottom: 15px;
  position: relative;
  background-color: rgba(255, 255, 255, 0.1);
  
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

const NewsTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  line-height: 1.3;
  font-weight: 600;
`;

const NewsDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
`;

const NewsSource = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #4fc3f7;
  font-weight: 600;
  font-size: 0.85rem;
`;

const NewsDate = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const ReadMoreButton = styled.a`
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

function NewsPage({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('general');
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCategories, setUserCategories] = useState([]);

  const allCategories = [
    { id: 'general', label: '📰 General', emoji: '📰' },
    { id: 'technology', label: '💻 Technology', emoji: '💻' },
    { id: 'business', label: '💼 Business', emoji: '💼' },
    { id: 'health', label: '🏥 Health', emoji: '🏥' },
    { id: 'science', label: '🔬 Science', emoji: '🔬' },
    { id: 'sports', label: '⚽ Sports', emoji: '⚽' },
    { id: 'entertainment', label: '🎬 Entertainment', emoji: '🎬' }
  ];

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newsRes = await ApiService.getNews();
      setNewsData(newsRes);
      
      // Extract user categories from the response
      if (newsRes?.user_preferences && newsRes.user_preferences.length > 0) {
        setUserCategories(newsRes.user_preferences);
        // Set the first user preference as active category if current active is not in preferences
        if (!newsRes.user_preferences.includes(activeCategory)) {
          setActiveCategory(newsRes.user_preferences[0]);
        }
      } else {
        // Fallback to general if no preferences
        setUserCategories(['general']);
        setActiveCategory('general');
      }
    } catch (err) {
      setError('Failed to fetch news. Please try again.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    fetchNews();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter categories to show only user's preferred categories
  const availableCategories = allCategories.filter(category => 
    userCategories.includes(category.id)
  );

  const filteredNews = newsData?.articles?.filter(article => {
    if (activeCategory === 'general') return true;
    return article.category?.toLowerCase() === activeCategory.toLowerCase();
  }) || [];

  return (
    <NewsPageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>
          <FiArrowLeft />
          Back to Dashboard
        </BackButton>
        <PageTitle>
          <FaNewspaper />
          News
        </PageTitle>
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {newsData?.user_categories && newsData.user_categories.length > 0 && (
        <PreferencesInfo>
          🎯 News filtered by your preferences: {newsData.user_categories.join(', ')}
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
          Loading news articles...
        </LoadingSpinner>
      ) : filteredNews.length > 0 ? (
        <NewsGrid>
          {filteredNews.map((article, index) => (
            <NewsCard key={index}>
              <NewsImage image={article.urlToImage || article.image} />
              <NewsTitle>{article.title}</NewsTitle>
              <NewsDescription>
                {article.description || 'No description available'}
              </NewsDescription>
              <NewsMeta>
                <NewsSource>
                  <FaUser />
                  {article.source?.name || article.source || 'Unknown Source'}
                </NewsSource>
                <NewsDate>
                  <FaClock />
                  {formatDate(article.publishedAt || article.published_at)}
                </NewsDate>
              </NewsMeta>
              <ReadMoreButton 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FiExternalLink style={{ marginRight: '5px' }} />
                Read Full Article
              </ReadMoreButton>
            </NewsCard>
          ))}
        </NewsGrid>
      ) : (
        <ErrorMessage>
          No {activeCategory} news articles available at the moment.
        </ErrorMessage>
      )}
    </NewsPageContainer>
  );
}

export default NewsPage;
