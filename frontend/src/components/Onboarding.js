import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

const OnboardingContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  color: white;
  font-weight: 300;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  color: white;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const InterestsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const InterestChip = styled.button`
  padding: 12px 20px;
  border: 2px solid ${props => props.selected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 25px;
  background: ${props => props.selected ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  border-radius: 15px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const interestCategories = {
  'News': ['Technology', 'Finance', 'Sports', 'Politics', 'Business', 'Science'],
  'Jobs': ['AI', 'Cloud', 'Startup', 'Remote', 'Finance', 'Marketing'],
  'Entertainment': ['Movies', 'Music', 'Gaming', 'OTT', 'Comedy', 'Documentary'],
  'Shopping': ['Fashion', 'Electronics', 'Home', 'Books', 'Beauty', 'Sports'],
  'Food': ['Pizza', 'Desserts', 'Indian', 'Italian', 'Chinese', 'Healthy']
};

function Onboarding({ onUserCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: []
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter(i => i !== interest)
        : [...formData.interests, interest]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.interests.length > 0) {
      setLoading(true);
      
      try {
        const response = await axios.post('/api/users', formData);
        onUserCreate(response.data);
      } catch (error) {
        console.error('Error creating user:', error);
        // Create user locally if API fails
        const userData = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString()
        };
        onUserCreate(userData);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <OnboardingContainer>
      <Title>Welcome to Your Dashboard! 🚀</Title>
      <Subtitle>
        Let's personalize your experience by learning about your interests.
        This will help us recommend the best content for you.
      </Subtitle>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">What's your name?</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>What interests you? (Select multiple)</Label>
            {Object.entries(interestCategories).map(([category, interests]) => (
              <div key={category}>
                <h4 style={{ color: 'white', margin: '20px 0 10px 0', fontSize: '16px' }}>
                  {category}
                </h4>
                <InterestsContainer>
                  {interests.map(interest => (
                    <InterestChip
                      key={interest}
                      type="button"
                      selected={formData.interests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                    >
                      {formData.interests.includes(interest) && <FiCheck />}
                      {interest}
                    </InterestChip>
                  ))}
                </InterestsContainer>
              </div>
            ))}
          </FormGroup>

          <SubmitButton type="submit" disabled={loading || !formData.name || !formData.email || formData.interests.length === 0}>
            {loading ? (
              <>
                <LoadingSpinner />
                Creating your profile...
              </>
            ) : (
              <>
                Get Started
                <FiArrowRight />
              </>
            )}
          </SubmitButton>
        </form>
      </FormContainer>
    </OnboardingContainer>
  );
}

export default Onboarding;
