import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiMapPin, FiDollarSign, FiHome, FiExternalLink, FiFilter } from 'react-icons/fi';
import { FaBriefcase } from 'react-icons/fa';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #1a202c;
  padding: 20px;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
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
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const PreferencesInfo = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const PreferencesTitle = styled.h3`
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
`;

const PreferencesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PreferenceTag = styled.span`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
`;

const JobCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const JobTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
`;

const Company = styled.div`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  font-weight: 500;
`;

const JobDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
`;

const SkillsContainer = styled.div`
  margin: 15px 0;
`;

const SkillsTitle = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-weight: 500;
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Skill = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ApplyButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #4299e1;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  color: #ff6b6b;
  text-align: center;
`;

const NoJobsMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

const categoryDisplayNames = {
  'frontend_developer': 'Frontend Developer 🌐',
  'backend_developer': 'Backend Developer ⚙️',
  'data_analyst': 'Data Analyst 📊',
  'ai_ml_engineer': 'AI/ML Engineer 🤖',
  'graphic_designer': 'Graphic Designer 🎨',
  'video_editor': 'Video Editor 🎬',
  'marketing': 'Marketing 📈',
  'android_developer': 'Android Developer 📱'
};

function JobsPage({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPreferences, setUserPreferences] = useState([]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please log in to view jobs');
        return;
      }

      // Fetch jobs based on user's MongoDB preferences only
      const response = await fetch('http://localhost:5000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      setUserPreferences(data.user_preferences || []);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    return salary.replace(/₹\s*/, '₹ ');
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    return location.length > 30 ? location.substring(0, 30) + '...' : location;
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft />
          Back to Dashboard
        </BackButton>
        <Title>
          <FaBriefcase />
          Job Opportunities
        </Title>
      </Header>

      <PreferencesInfo>
        <PreferencesTitle>
          <FiFilter />
          Your Job Preferences
        </PreferencesTitle>
        {userPreferences.length > 0 ? (
          <PreferencesList>
            {userPreferences.map((preference, index) => (
              <PreferenceTag key={index}>
                {categoryDisplayNames[preference] || preference}
              </PreferenceTag>
            ))}
          </PreferencesList>
        ) : (
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
            No job preferences set. Go to Settings to configure your preferences.
          </div>
        )}
      </PreferencesInfo>

      {loading && (
        <LoadingSpinner>
          <FiFilter className="spinning" />
          Loading jobs...
        </LoadingSpinner>
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {!loading && !error && jobs.length === 0 && (
        <NoJobsMessage>
          No jobs found for the selected category. Try selecting a different category or check back later.
        </NoJobsMessage>
      )}

      {!loading && !error && jobs.length > 0 && (
        <JobsGrid>
          {jobs.map((job, index) => (
            <JobCard key={job.id || index}>
              <JobTitle>{job.title}</JobTitle>
              <Company>{job.company}</Company>
              
              <JobDetails>
                <DetailItem>
                  <FiMapPin />
                  {formatLocation(job.location)}
                </DetailItem>
                <DetailItem>
                  <FiDollarSign />
                  {formatSalary(job.salary)}
                </DetailItem>
                {job.work_from_home && (
                  <DetailItem>
                    <FiHome />
                    Work from Home Available
                  </DetailItem>
                )}
              </JobDetails>

              {job.skills && job.skills.length > 0 && (
                <SkillsContainer>
                  <SkillsTitle>Required Skills:</SkillsTitle>
                  <Skills>
                    {job.skills.slice(0, 6).map((skill, skillIndex) => (
                      <Skill key={skillIndex}>{skill}</Skill>
                    ))}
                    {job.skills.length > 6 && (
                      <Skill>+{job.skills.length - 6} more</Skill>
                    )}
                  </Skills>
                </SkillsContainer>
              )}

              <ApplyButton 
                href={job.job_link} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FiExternalLink />
                Apply Now
              </ApplyButton>
            </JobCard>
          ))}
        </JobsGrid>
      )}
    </PageContainer>
  );
}

export default JobsPage;
