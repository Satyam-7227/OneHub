import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { FaRedditAlien, FaArrowUp, FaComments, FaUser } from 'react-icons/fa';

const RedditPageContainer = styled.div`
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

const SubredditTabs = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
`;

const SubredditTab = styled.button`
  background: ${props => props.active ? 'rgba(255, 69, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.active ? '#ff4500' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active ? '#ff4500' : 'white'};
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 69, 0, 0.2);
    border-color: #ff4500;
    transform: translateY(-2px);
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const PostCard = styled.div`
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

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const SubredditBadge = styled.div`
  background: rgba(255, 69, 0, 0.2);
  color: #ff4500;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
`;

const PostTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  line-height: 1.3;
  font-weight: 600;
`;

const PostContent = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
`;

const PostScore = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #ff4500;
  font-weight: 600;
  font-size: 0.9rem;
`;

const PostComments = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const ViewPostButton = styled.a`
  display: inline-block;
  background: linear-gradient(45deg, #ff4500, #ff6b35);
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
    box-shadow: 0 10px 20px rgba(255, 69, 0, 0.3);
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
  background: rgba(255, 69, 0, 0.1);
  border: 1px solid rgba(255, 69, 0, 0.3);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 20px;
  color: #ff4500;
  text-align: center;
  font-size: 0.9rem;
`;

function RedditPage({ onBack }) {
  const [activeSubreddit, setActiveSubreddit] = useState('technology');
  const [redditData, setRedditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubreddits, setUserSubreddits] = useState([]);

  const allSubreddits = [
    { id: 'technology', label: '💻 r/Technology', emoji: '💻' },
    { id: 'programming', label: '⌨️ r/Programming', emoji: '⌨️' },
    { id: 'science', label: '🔬 r/Science', emoji: '🔬' },
    { id: 'world', label: '🌍 r/World', emoji: '🌍' },
    { id: 'gaming', label: '🎮 r/Gaming', emoji: '🎮' },
    { id: 'movies', label: '🎬 r/Movies', emoji: '🎬' },
    { id: 'music', label: '🎵 r/Music', emoji: '🎵' },
    { id: 'sports', label: '⚽ r/Sports', emoji: '⚽' }
  ];

  const fetchRedditPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const redditRes = await ApiService.getRedditPosts(activeSubreddit);
      console.log(`Reddit API Response for ${activeSubreddit}:`, redditRes);
      setRedditData(redditRes);
      
      // Use user preferences from the Reddit API response
      if (redditRes && redditRes.user_preferences) {
        console.log('User Reddit preferences from API:', redditRes.user_preferences);
        setUserSubreddits(redditRes.user_preferences);
      }
    } catch (err) {
      setError('Failed to fetch Reddit posts. Please try again.');
      console.error('Error fetching Reddit posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedditPosts();
  }, [activeSubreddit]);

  const handleRefresh = () => {
    fetchRedditPosts();
  };

  const formatScore = (score) => {
    if (!score) return '0';
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  const formatComments = (comments) => {
    if (!comments) return '0 comments';
    if (comments >= 1000) {
      return `${(comments / 1000).toFixed(1)}k comments`;
    }
    return `${comments} comments`;
  };

  // Filter subreddits to show only user's preferred subreddits
  const availableSubreddits = allSubreddits.filter(subreddit => 
    userSubreddits.includes(subreddit.id)
  );

  return (
    <RedditPageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>
          <FiArrowLeft />
          Back to Dashboard
        </BackButton>
        <PageTitle>
          <FaRedditAlien />
          Reddit Posts
        </PageTitle>
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {redditData?.user_preferences && redditData.user_preferences.length > 0 && (
        <PreferencesInfo>
          🎯 Reddit posts filtered by your preferences: r/{redditData.user_preferences.join(', r/')}
        </PreferencesInfo>
      )}

      <SubredditTabs>
        {availableSubreddits.map(subreddit => (
          <SubredditTab 
            key={subreddit.id}
            active={activeSubreddit === subreddit.id} 
            onClick={() => setActiveSubreddit(subreddit.id)}
          >
            {subreddit.label}
          </SubredditTab>
        ))}
      </SubredditTabs>

      {loading ? (
        <LoadingSpinner>
          <FiRefreshCw className="spinning" />
          Loading Reddit posts...
        </LoadingSpinner>
      ) : redditData?.posts && redditData.posts.length > 0 ? (
        <PostsGrid>
          {redditData.posts.map((post, index) => (
            <PostCard key={post.id || index}>
              <PostHeader>
                <SubredditBadge>r/{post.subreddit || activeSubreddit}</SubredditBadge>
                <AuthorInfo>
                  <FaUser />
                  u/{post.author || 'Unknown'}
                </AuthorInfo>
              </PostHeader>
              <PostTitle>{post.title}</PostTitle>
              <PostContent>
                {post.selftext || post.description || 'Click to view full post content'}
              </PostContent>
              <PostMeta>
                <PostScore>
                  <FaArrowUp />
                  {formatScore(post.score || post.ups)} upvotes
                </PostScore>
                <PostComments>
                  <FaComments />
                  {formatComments(post.num_comments || post.comments)}
                </PostComments>
              </PostMeta>
              <ViewPostButton 
                href={post.url || `https://reddit.com${post.permalink}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FiExternalLink style={{ marginRight: '5px' }} />
                View on Reddit
              </ViewPostButton>
            </PostCard>
          ))}
        </PostsGrid>
      ) : (
        <ErrorMessage>
          No posts available for r/{activeSubreddit} at the moment.
        </ErrorMessage>
      )}
    </RedditPageContainer>
  );
}

export default RedditPage;
