import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings, FiHome } from 'react-icons/fi';

const HeaderContainer = styled.header`
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
  padding: 15px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: #e2e8f0;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: ${props => props.$isActive ? '#4a5568' : 'transparent'};
  border: 1px solid ${props => props.$isActive ? '#63b3ed' : 'transparent'};

  &:hover {
    background: #374151;
    border-color: #63b3ed;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e2e8f0;
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const LogoutButton = styled.button`
  background: #374151;
  border: 1px solid #4a5568;
  border-radius: 8px;
  color: #e2e8f0;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.3s ease;

  &:hover {
    background: #4a5568;
    border-color: #63b3ed;
  }
`;

function Header({ user, onLogout }) {
  const location = useLocation();
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('dashboard_user');
      window.location.reload();
    }
  };

  const isActive = (path) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          🚀 OneHub
        </Logo>
        {user && (
          <>
            <Navigation>
              <NavLink to="/dashboard" $isActive={isActive('/dashboard')}>
                <FiHome />
                Dashboard
              </NavLink>
            </Navigation>
            <UserSection>
              <UserInfo>
                <FiUser />
                {user.name}
              </UserInfo>
              <Link to="/settings" style={{ textDecoration: 'none' }}>
                <LogoutButton as="div">
                  <FiSettings />
                  Settings
                </LogoutButton>
              </Link>
              <LogoutButton onClick={handleLogout}>
                <FiLogOut />
                Logout
              </LogoutButton>
            </UserSection>
          </>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;
