import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSettings, FiUser, FiMail, FiSave } from 'react-icons/fi';

const SettingsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const SettingsCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: white;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 300;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoValue = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  color: white;
  margin-bottom: 20px;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionIcon = styled.span`
  font-size: 1.8rem;
`;

const PreferenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const PreferenceChip = styled.div`
  background: ${props => props.selected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.selected ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const ChipEmoji = styled.div`
  font-size: 1.5rem;
  margin-bottom: 5px;
`;

const ChipText = styled.div`
  font-size: 12px;
  font-weight: 500;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 20px;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #51cf66;
  text-align: center;
  margin-bottom: 20px;
`;

// Food preferences data
const foodOptions = [
  { id: 'italian', name: 'Italian', emoji: '🍝' },
  { id: 'chinese', name: 'Chinese', emoji: '🥢' },
  { id: 'indian', name: 'Indian', emoji: '🍛' },
  { id: 'mexican', name: 'Mexican', emoji: '🌮' },
  { id: 'japanese', name: 'Japanese', emoji: '🍣' },
  { id: 'american', name: 'American', emoji: '🍔' },
  { id: 'thai', name: 'Thai', emoji: '🍜' },
  { id: 'mediterranean', name: 'Mediterranean', emoji: '🥗' }
];

const dietaryOptions = [
  { id: 'vegetarian', name: 'Vegetarian', emoji: '🥬' },
  { id: 'vegan', name: 'Vegan', emoji: '🌱' },
  { id: 'gluten-free', name: 'Gluten Free', emoji: '🌾' },
  { id: 'keto', name: 'Keto', emoji: '🥑' },
  { id: 'halal', name: 'Halal', emoji: '🕌' },
  { id: 'kosher', name: 'Kosher', emoji: '✡️' }
];

// Movie preferences data
const movieGenres = [
  { id: 'action', name: 'Action', emoji: '💥' },
  { id: 'comedy', name: 'Comedy', emoji: '😂' },
  { id: 'drama', name: 'Drama', emoji: '🎭' },
  { id: 'horror', name: 'Horror', emoji: '👻' },
  { id: 'romance', name: 'Romance', emoji: '💕' },
  { id: 'sci-fi', name: 'Sci-Fi', emoji: '🚀' },
  { id: 'thriller', name: 'Thriller', emoji: '🔪' },
  { id: 'documentary', name: 'Documentary', emoji: '📽️' }
];

const movieLanguages = [
  { id: 'english', name: 'English', emoji: '🇺🇸' },
  { id: 'spanish', name: 'Spanish', emoji: '🇪🇸' },
  { id: 'french', name: 'French', emoji: '🇫🇷' },
  { id: 'hindi', name: 'Hindi', emoji: '🇮🇳' },
  { id: 'korean', name: 'Korean', emoji: '🇰🇷' },
  { id: 'japanese', name: 'Japanese', emoji: '🇯🇵' }
];

// News preferences data
const newsCategories = [
  { id: 'technology', name: 'Technology', emoji: '💻' },
  { id: 'business', name: 'Business', emoji: '💼' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'health', name: 'Health', emoji: '🏥' },
  { id: 'science', name: 'Science', emoji: '🔬' },
  { id: 'politics', name: 'Politics', emoji: '🏛️' },
  { id: 'world', name: 'World News', emoji: '🌍' }
];

// YouTube preferences data
const youtubeCategories = [
  { id: 'gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'comedy', name: 'Comedy', emoji: '😂' },
  { id: 'tech', name: 'Tech Reviews', emoji: '📱' },
  { id: 'cooking', name: 'Cooking', emoji: '👨‍🍳' },
  { id: 'fitness', name: 'Fitness', emoji: '💪' },
  { id: 'travel', name: 'Travel', emoji: '✈️' }
];

// Deals preferences data
const dealCategories = [
  { id: 'electronics', name: 'Electronics', emoji: '📱' },
  { id: 'fashion', name: 'Fashion', emoji: '👕' },
  { id: 'home', name: 'Home & Garden', emoji: '🏠' },
  { id: 'books', name: 'Books', emoji: '📚' },
  { id: 'sports', name: 'Sports & Outdoors', emoji: '🏃‍♂️' },
  { id: 'beauty', name: 'Beauty', emoji: '💄' },
  { id: 'automotive', name: 'Automotive', emoji: '🚗' },
  { id: 'toys', name: 'Toys & Games', emoji: '🧸' }
];

// Job preferences data
const jobCategories = [
  { id: 'technology', name: 'Technology', emoji: '💻' },
  { id: 'marketing', name: 'Marketing', emoji: '📈' },
  { id: 'finance', name: 'Finance', emoji: '💰' },
  { id: 'healthcare', name: 'Healthcare', emoji: '🏥' },
  { id: 'education', name: 'Education', emoji: '🎓' },
  { id: 'design', name: 'Design', emoji: '🎨' },
  { id: 'sales', name: 'Sales', emoji: '💼' },
  { id: 'engineering', name: 'Engineering', emoji: '⚙️' }
];

function Settings({ user }) {
  // Initialize preferences with default empty values that match our data structure
  const defaultPreferences = {
    food: { cuisines: [], dietary: [] },
    movies: { genres: [], languages: [] },
    news: { categories: [] },
    youtube: { categories: [] },
    deals: { categories: [] },
    jobs: { categories: [] }
  };

  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        return;
      }
      
      console.log('Loading preferences...');
      const response = await fetch('http://localhost:5000/api/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded preferences:', data);
        
        // Merge loaded preferences with defaults to ensure all categories exist
        const mergedPreferences = { ...defaultPreferences };
        
        if (data.preferences) {
          Object.keys(data.preferences).forEach(category => {
            if (mergedPreferences[category]) {
              mergedPreferences[category] = {
                ...mergedPreferences[category],
                ...data.preferences[category]
              };
            } else {
              mergedPreferences[category] = data.preferences[category];
            }
          });
        }
        
        setPreferences(mergedPreferences);
      } else {
        console.error('Failed to load preferences:', await response.text());
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const togglePreference = (category, subcategory, optionId) => {
    setPreferences(prev => {
      // Ensure the category and subcategory exist
      const current = prev[category]?.[subcategory] || [];
      
      // Toggle the option
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      
      // Create a new preferences object with the updated value
      const newPreferences = {
        ...prev,
        [category]: {
          ...prev[category],
          [subcategory]: updated
        }
      };
      
      console.log('Updated preferences:', newPreferences);
      return newPreferences;
    });
  };

  const savePreferences = async () => {
    setLoading(true);
    setSuccess('');
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }
      
      console.log('Saving preferences:', preferences);
      const response = await fetch('http://localhost:5000/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save preferences');
      }
      
      const result = await response.json();
      console.log('Save response:', result);
      setSuccess('Preferences updated successfully!');
      
      // Reload preferences to ensure we have the latest from the server
      await loadPreferences();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(error.message || 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContainer>
      <SettingsCard>
        <Title>
          <FiSettings />
          Account Settings
        </Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Section>
          <SectionTitle>
            <FiUser />
            Profile Information
          </SectionTitle>
          <UserInfoGrid>
            <InfoCard>
              <InfoLabel>
                <FiUser />
                Full Name
              </InfoLabel>
              <InfoValue>{user?.name || 'Not provided'}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>
                <FiMail />
                Email Address
              </InfoLabel>
              <InfoValue>{user?.email || 'Not provided'}</InfoValue>
            </InfoCard>
          </UserInfoGrid>
        </Section>

        <Section>
          <SectionTitle>
            🍽️ Food Preferences
          </SectionTitle>
          
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              Favorite Cuisines
            </h4>
            <PreferenceGrid>
              {foodOptions.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.food?.cuisines?.includes(option.id)}
                  onClick={() => togglePreference('food', 'cuisines', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              Dietary Restrictions
            </h4>
            <PreferenceGrid>
              {dietaryOptions.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.food?.dietary?.includes(option.id)}
                  onClick={() => togglePreference('food', 'dietary', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>
        </Section>

        <Section>
          <SectionTitle>
            🎬 Movie Preferences
          </SectionTitle>
          
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              Favorite Genres
            </h4>
            <PreferenceGrid>
              {movieGenres.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.movies?.genres?.includes(option.id)}
                  onClick={() => togglePreference('movies', 'genres', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              Preferred Languages
            </h4>
            <PreferenceGrid>
              {movieLanguages.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.movies?.languages?.includes(option.id)}
                  onClick={() => togglePreference('movies', 'languages', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>
        </Section>

        <Section>
          <SectionTitle>
            <SectionIcon>📰</SectionIcon>
            News Preferences
          </SectionTitle>
          
          <div>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              News Categories
            </h4>
            <PreferenceGrid>
              {newsCategories.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.news?.categories?.includes(option.id)}
                  onClick={() => togglePreference('news', 'categories', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>
        </Section>

        <Section>
          <SectionTitle>
            <SectionIcon>📺</SectionIcon>
            YouTube Preferences
          </SectionTitle>
          
          <div>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              YouTube Categories
            </h4>
            <PreferenceGrid>
              {youtubeCategories.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.youtube?.categories?.includes(option.id)}
                  onClick={() => togglePreference('youtube', 'categories', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>
        </Section>

        <Section>
          <SectionTitle>
            <SectionIcon>🏷️</SectionIcon>
            Deals Preferences
          </SectionTitle>
          
          <div>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              Deal Categories
            </h4>
            <PreferenceGrid>
              {dealCategories.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.deals?.categories?.includes(option.id)}
                  onClick={() => togglePreference('deals', 'categories', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>
        </Section>

        <Section>
          <SectionTitle>
            <SectionIcon>💼</SectionIcon>
            Job Preferences
          </SectionTitle>
          
          <div>
            <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
              Job Categories
            </h4>
            <PreferenceGrid>
              {jobCategories.map(option => (
                <PreferenceChip
                  key={option.id}
                  selected={preferences.jobs?.categories?.includes(option.id)}
                  onClick={() => togglePreference('jobs', 'categories', option.id)}
                >
                  <ChipEmoji>{option.emoji}</ChipEmoji>
                  <ChipText>{option.name}</ChipText>
                </PreferenceChip>
              ))}
            </PreferenceGrid>
          </div>
        </Section>

        <SaveButton onClick={savePreferences} disabled={loading}>
          <FiSave />
          {loading ? 'Saving...' : 'Save Preferences'}
        </SaveButton>
      </SettingsCard>
    </SettingsContainer>
  );
}

export default Settings;
