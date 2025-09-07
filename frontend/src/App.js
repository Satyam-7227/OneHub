import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import PreferencesSetup from './components/PreferencesSetup';
import Settings from './components/Settings';
import Header from './components/Header';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsPreferences, setNeedsPreferences] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user_data');
      
      if (token && savedUser) {
        setAuthToken(token);
        const userData = JSON.parse(savedUser);
        
        // Verify token with backend and get current user info
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Check if user has set preferences
          const hasPreferences = data.user.preferences && 
            (Object.keys(data.user.preferences).length > 0);
          setNeedsPreferences(!hasPreferences);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setIsAuthenticated(true);
    setNeedsPreferences(true); // New users need to set preferences
  };

  const handlePreferencesComplete = (preferences) => {
    setNeedsPreferences(false);
    // Update user data with preferences
    const updatedUser = { ...user, preferences };
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('dashboard_user');
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setNeedsPreferences(false);
  };

  if (isLoading) {
    return (
      <AppContainer>
        <MainContent>
          <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
            <h2>Loading your personalized dashboard...</h2>
          </div>
        </MainContent>
      </AppContainer>
    );
  }

  return (
    <Router>
      <AppContainer>
        {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
        <MainContent>
          <Routes>
            <Route 
              path="/" 
              element={
                !isAuthenticated ? (
                  <Auth onAuthSuccess={handleAuthSuccess} />
                ) : needsPreferences ? (
                  <PreferencesSetup 
                    user={user} 
                    onComplete={handlePreferencesComplete} 
                  />
                ) : (
                  <Dashboard user={user} onLogout={handleLogout} />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Auth onAuthSuccess={handleAuthSuccess} />
              } 
            />
            <Route 
              path="/settings" 
              element={
                isAuthenticated ? <Settings user={user} /> : <Auth onAuthSuccess={handleAuthSuccess} />
              } 
            />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;
