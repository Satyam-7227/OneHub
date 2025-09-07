import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';
import { FaNewspaper, FaBriefcase, FaPlay, FaTags, FaRedditAlien } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

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
    food: null,
    recommendations: null,
    nfts: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [newsRes, jobsRes, videosRes, dealsRes, redditRes, recommendationsRes] = await Promise.allSettled([
        ApiService.getNews(),
        ApiService.getJobs(),
        ApiService.getVideos(),
        ApiService.getDeals(),
        ApiService.getRedditPosts('technology'),
        ApiService.getRecommendations(user?.id || 'default_user')
      ]);

      setData({
        news: newsRes.status === 'fulfilled' ? newsRes.value : null,
        jobs: jobsRes.status === 'fulfilled' ? jobsRes.value : null,
        videos: videosRes.status === 'fulfilled' ? videosRes.value : null,
        deals: dealsRes.status === 'fulfilled' ? dealsRes.value : null,
        reddit: redditRes.status === 'fulfilled' ? redditRes.value : null,
        recommendations: recommendationsRes.status === 'fulfilled' ? recommendationsRes.value : null,
        movies: null,
        food: null,
        nfts: null
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

  // Removed unused handleUserAction function

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
      <DashboardHeader>
        <WelcomeText>
          Welcome back, {user.name}! 👋
        </WelcomeText>
        <ActionButtons>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
          <SettingsButton onClick={onLogout}>
            <FiLogOut />
            Logout
          </SettingsButton>
        </ActionButtons>
      </DashboardHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <GridContainer>
        <SectionCard>
          <SectionHeader>
            <SectionTitle><FaNewspaper /> Latest News</SectionTitle>
            {data.news?.articles && <ItemCount>{data.news.articles.length} articles</ItemCount>}
          </SectionHeader>
          {loading ? (
            <LoadingSpinner>Loading news...</LoadingSpinner>
          ) : data.news?.articles ? (
            <ContentList>
              {data.news.articles.map((article, index) => (
                <ContentItem key={index}>
                  <ItemTitle>{article.title}</ItemTitle>
                  <ItemDescription>{article.description || 'No description available'}</ItemDescription>
                  <ItemMeta>
                    <span>{article.source?.name || 'Unknown Source'}</span>
                    <ItemLink href={article.url} target="_blank" rel="noopener noreferrer">
                      Read More →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              ))}
            </ContentList>
          ) : (
            <p>No news data available</p>
          )}
        </SectionCard>

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

        <SectionCard>
          <SectionHeader>
            <SectionTitle><FaPlay /> Trending Videos</SectionTitle>
            {data.videos?.videos && <ItemCount>{data.videos.videos.length} videos</ItemCount>}
          </SectionHeader>
          {loading ? (
            <LoadingSpinner>Loading videos...</LoadingSpinner>
          ) : data.videos?.videos ? (
            <ContentList>
              {data.videos.videos.map((video, index) => (
                <ContentItem key={index}>
                  <ItemTitle>{video.title}</ItemTitle>
                  <ItemDescription>{video.description || 'Watch this trending video'}</ItemDescription>
                  <ItemMeta>
                    <span>{video.channel || video.channelTitle || 'YouTube'}</span>
                    <ItemLink href={video.url || `https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                      Watch →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              ))}
            </ContentList>
          ) : (
            <p>No video data available</p>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <SectionTitle><FaTags /> Hot Deals</SectionTitle>
            {data.deals?.deals && <ItemCount>{data.deals.deals.length} deals</ItemCount>}
          </SectionHeader>
          {loading ? (
            <LoadingSpinner>Loading deals...</LoadingSpinner>
          ) : data.deals?.deals ? (
            <ContentList>
              {data.deals.deals.map((deal, index) => (
                <ContentItem key={index}>
                  <ItemTitle>{deal.title}</ItemTitle>
                  <ItemDescription>{deal.description || `Great deal available - ${deal.discount || 'Special offer'}`}</ItemDescription>
                  <ItemMeta>
                    <span>{deal.store || deal.platform || 'Online Store'}</span>
                    <ItemLink href={deal.url || deal.link || '#'} target="_blank" rel="noopener noreferrer">
                      Get Deal →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              ))}
            </ContentList>
          ) : (
            <p>No deals data available</p>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <SectionTitle><FaRedditAlien /> Reddit Posts</SectionTitle>
            {data.reddit?.posts && <ItemCount>{data.reddit.posts.length} posts</ItemCount>}
          </SectionHeader>
          {loading ? (
            <LoadingSpinner>Loading Reddit posts...</LoadingSpinner>
          ) : data.reddit?.posts ? (
            <ContentList>
              {data.reddit.posts.map((post, index) => (
                <ContentItem key={index}>
                  <ItemTitle>{post.title}</ItemTitle>
                  <ItemDescription>{post.description || 'Reddit discussion'}</ItemDescription>
                  <ItemMeta>
                    <span>r/{post.subreddit} • u/{post.author} • {post.score} upvotes</span>
                    <ItemLink href={post.url} target="_blank" rel="noopener noreferrer">
                      View Post →
                    </ItemLink>
                  </ItemMeta>
                </ContentItem>
              ))}
            </ContentList>
          ) : (
            <p>No Reddit data available</p>
          )}
        </SectionCard>

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
