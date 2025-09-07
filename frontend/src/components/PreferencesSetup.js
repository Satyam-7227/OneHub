import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

const SetupContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const SetupCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: white;
  margin-bottom: 20px;
  font-size: 2.5rem;
  font-weight: 300;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  gap: 20px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const StepNumber = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const CategorySection = styled.div`
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h3`
  color: white;
  margin-bottom: 20px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CategoryIcon = styled.span`
  font-size: 1.8rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const OptionCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${props => props.selected ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  ${props => props.selected && `
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  `}
`;

const OptionEmoji = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
`;

const OptionText = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
`;

const Button = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

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

function PreferencesSetup({ user, onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    food: {
      cuisines: [],
      dietary: []
    },
    movies: {
      genres: [],
      languages: []
    },
    news: {
      categories: []
    },
    youtube: {
      categories: []
    },
    deals: {
      categories: []
    },
    jobs: {
      categories: []
    }
  });

  const toggleOption = (category, subcategory, optionId) => {
    setPreferences(prev => {
      const current = prev[category][subcategory];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [subcategory]: updated
        }
      };
    });
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        onComplete(preferences);
      } else {
        if (onComplete) {
          onComplete(preferences);
        }
      }
      // Redirect to dashboard after saving preferences
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return preferences.food.cuisines.length > 0;
      case 2: return preferences.movies.genres.length > 0;
      case 3: return preferences.news.categories.length > 0;
      case 4: return preferences.youtube.categories.length > 0;
      case 5: return preferences.deals.categories.length > 0;
      case 6: return preferences.jobs.categories.length > 0;
      default: return true;
    }
  };

  return (
    <SetupContainer>
      <SetupCard>
        <Title>Let's Personalize Your Experience</Title>
        <Subtitle>
          Tell us about your preferences so we can recommend the best content for you
        </Subtitle>

        <StepIndicator>
          <Step active={step >= 1}>
            <StepNumber active={step >= 1}>1</StepNumber>
            Food
          </Step>
          <Step active={step >= 2}>
            <StepNumber active={step >= 2}>2</StepNumber>
            Movies
          </Step>
          <Step active={step >= 3}>
            <StepNumber active={step >= 3}>3</StepNumber>
            News
          </Step>
          <Step active={step >= 4}>
            <StepNumber active={step >= 4}>4</StepNumber>
            YouTube
          </Step>
          <Step active={step >= 5}>
            <StepNumber active={step >= 5}>5</StepNumber>
            Deals
          </Step>
          <Step active={step >= 6}>
            <StepNumber active={step >= 6}>6</StepNumber>
            Jobs
          </Step>
        </StepIndicator>

        {step === 1 && (
          <>
            <CategorySection>
              <CategoryTitle>
                <CategoryIcon>🍽️</CategoryIcon>
                What cuisines do you enjoy?
              </CategoryTitle>
              <OptionsGrid>
                {foodOptions.map(option => (
                  <OptionCard
                    key={option.id}
                    selected={preferences.food.cuisines.includes(option.id)}
                    onClick={() => toggleOption('food', 'cuisines', option.id)}
                  >
                    <OptionEmoji>{option.emoji}</OptionEmoji>
                    <OptionText>{option.name}</OptionText>
                  </OptionCard>
                ))}
              </OptionsGrid>
            </CategorySection>

            <CategorySection>
              <CategoryTitle>
                <CategoryIcon>🥗</CategoryIcon>
                Any dietary preferences?
              </CategoryTitle>
              <OptionsGrid>
                {dietaryOptions.map(option => (
                  <OptionCard
                    key={option.id}
                    selected={preferences.food.dietary.includes(option.id)}
                    onClick={() => toggleOption('food', 'dietary', option.id)}
                  >
                    <OptionEmoji>{option.emoji}</OptionEmoji>
                    <OptionText>{option.name}</OptionText>
                  </OptionCard>
                ))}
              </OptionsGrid>
            </CategorySection>
          </>
        )}

        {step === 2 && (
          <>
            <CategorySection>
              <CategoryTitle>
                <CategoryIcon>🎬</CategoryIcon>
                What movie genres do you like?
              </CategoryTitle>
              <OptionsGrid>
                {movieGenres.map(option => (
                  <OptionCard
                    key={option.id}
                    selected={preferences.movies.genres.includes(option.id)}
                    onClick={() => toggleOption('movies', 'genres', option.id)}
                  >
                    <OptionEmoji>{option.emoji}</OptionEmoji>
                    <OptionText>{option.name}</OptionText>
                  </OptionCard>
                ))}
              </OptionsGrid>
            </CategorySection>

            <CategorySection>
              <CategoryTitle>
                <CategoryIcon>🌍</CategoryIcon>
                Preferred languages?
              </CategoryTitle>
              <OptionsGrid>
                {movieLanguages.map(option => (
                  <OptionCard
                    key={option.id}
                    selected={preferences.movies.languages.includes(option.id)}
                    onClick={() => toggleOption('movies', 'languages', option.id)}
                  >
                    <OptionEmoji>{option.emoji}</OptionEmoji>
                    <OptionText>{option.name}</OptionText>
                  </OptionCard>
                ))}
              </OptionsGrid>
            </CategorySection>
          </>
        )}

        {step === 3 && (
          <CategorySection>
            <CategoryTitle>
              <CategoryIcon>📰</CategoryIcon>
              What news topics interest you?
            </CategoryTitle>
            <OptionsGrid>
              {newsCategories.map(option => (
                <OptionCard
                  key={option.id}
                  selected={preferences.news.categories.includes(option.id)}
                  onClick={() => toggleOption('news', 'categories', option.id)}
                >
                  <OptionEmoji>{option.emoji}</OptionEmoji>
                  <OptionText>{option.name}</OptionText>
                </OptionCard>
              ))}
            </OptionsGrid>
          </CategorySection>
        )}

        {step === 4 && (
          <CategorySection>
            <CategoryTitle>
              <CategoryIcon>📺</CategoryIcon>
              What YouTube content do you enjoy?
            </CategoryTitle>
            <OptionsGrid>
              {youtubeCategories.map(option => (
                <OptionCard
                  key={option.id}
                  selected={preferences.youtube.categories.includes(option.id)}
                  onClick={() => toggleOption('youtube', 'categories', option.id)}
                >
                  <OptionEmoji>{option.emoji}</OptionEmoji>
                  <OptionText>{option.name}</OptionText>
                </OptionCard>
              ))}
            </OptionsGrid>
          </CategorySection>
        )}

        {step === 5 && (
          <CategorySection>
            <CategoryTitle>
              <CategoryIcon>🏷️</CategoryIcon>
              What deals and products interest you?
            </CategoryTitle>
            <OptionsGrid>
              {dealCategories.map(option => (
                <OptionCard
                  key={option.id}
                  selected={preferences.deals.categories.includes(option.id)}
                  onClick={() => toggleOption('deals', 'categories', option.id)}
                >
                  <OptionEmoji>{option.emoji}</OptionEmoji>
                  <OptionText>{option.name}</OptionText>
                </OptionCard>
              ))}
            </OptionsGrid>
          </CategorySection>
        )}

        {step === 6 && (
          <CategorySection>
            <CategoryTitle>
              <CategoryIcon>💼</CategoryIcon>
              What job categories interest you?
            </CategoryTitle>
            <OptionsGrid>
              {jobCategories.map(option => (
                <OptionCard
                  key={option.id}
                  selected={preferences.jobs.categories.includes(option.id)}
                  onClick={() => toggleOption('jobs', 'categories', option.id)}
                >
                  <OptionEmoji>{option.emoji}</OptionEmoji>
                  <OptionText>{option.name}</OptionText>
                </OptionCard>
              ))}
            </OptionsGrid>
          </CategorySection>
        )}

        <ButtonContainer>
          <Button onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1}>
            Back
          </Button>
          <Button 
            primary 
            onClick={handleNext} 
            disabled={!canProceed() || loading}
          >
            {loading ? 'Saving...' : (step === 6 ? 'Complete Setup' : 'Next')}
            {!loading && <FiArrowRight />}
          </Button>
        </ButtonContainer>
      </SetupCard>
    </SetupContainer>
  );
}

export default PreferencesSetup;
