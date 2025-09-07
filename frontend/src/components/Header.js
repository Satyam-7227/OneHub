import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings, FiHome, FiCloud, FiDollarSign, FiBook } from 'react-icons/fi';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 0;
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
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.$isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
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
  color: white;
  font-size: 14px;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
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
          🚀 Personalized Dashboard
        </Logo>
        {user && (
          <>
            <Navigation>
              <NavLink to="/dashboard" $isActive={isActive('/dashboard')}>
                <FiHome />
                Dashboard
              </NavLink>
              <NavLink to="/weather" $isActive={isActive('/weather')}>
                <FiCloud />
                Weather
              </NavLink>
              <NavLink to="/crypto" $isActive={isActive('/crypto')}>
                <FiDollarSign />
                Crypto
              </NavLink>
              <NavLink to="/recipes" $isActive={isActive('/recipes')}>
                <FiBook />
                Recipes
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
