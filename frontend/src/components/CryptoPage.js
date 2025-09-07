import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ApiService from '../api/api';
import { FiRefreshCw, FiArrowLeft, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiDogecoin, SiLitecoin } from 'react-icons/si';

const CryptoPageContainer = styled.div`
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
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 25px;
  color: #ffc107;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 193, 7, 0.3);
    transform: translateY(-2px);
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const CryptoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 20px;
`;

const CryptoCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 193, 7, 0.5);
  }
`;

const CryptoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CryptoInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const CryptoIcon = styled.div`
  font-size: 2.5rem;
  color: #ffc107;
`;

const CryptoName = styled.div`
  h3 {
    margin: 0 0 5px 0;
    font-size: 1.3rem;
    color: white;
  }
  
  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    text-transform: uppercase;
  }
`;

const PriceChange = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  background: ${props => props.positive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  color: ${props => props.positive ? '#4caf50' : '#f44336'};
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin: 15px 0;
  color: #ffc107;
`;

const CryptoStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
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

function CryptoPage({ onBack }) {
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCryptoIcon = (symbol) => {
    const iconMap = {
      'BTC': <FaBitcoin />,
      'ETH': <FaEthereum />,
      'DOGE': <SiDogecoin />,
      'LTC': <SiLitecoin />
    };
    return iconMap[symbol] || <FaBitcoin />;
  };

  const formatPrice = (price) => {
    if (price >= 1000) {
      return `$${price.toLocaleString()}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const fetchCrypto = async () => {
    try {
      setLoading(true);
      const cryptoRes = await ApiService.getCrypto();
      console.log('Crypto API Response:', cryptoRes);
      setCryptoData(cryptoRes);
    } catch (error) {
      console.error('Error fetching crypto:', error);
      setError('Failed to load cryptocurrency data. Please check if you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoClick = (crypto) => {
    // Open CoinGecko page for the specific cryptocurrency
    window.open(`https://www.coingecko.com/en/coins/${crypto.id}`, '_blank');
  };

  useEffect(() => {
    fetchCrypto();
  }, []);

  const handleRefresh = () => {
    fetchCrypto();
  };

  if (loading) {
    return (
      <CryptoPageContainer>
        <PageHeader>
          <BackButton onClick={onBack}>
            <FiArrowLeft /> Back to Dashboard
          </BackButton>
          <PageTitle>₿ Crypto</PageTitle>
          <div></div>
        </PageHeader>
        <LoadingSpinner>
          <FiRefreshCw className="spinning" />
          Loading cryptocurrency data...
        </LoadingSpinner>
      </CryptoPageContainer>
    );
  }

  if (error) {
    return (
      <CryptoPageContainer>
        <PageHeader>
          <BackButton onClick={onBack}>
            <FiArrowLeft /> Back to Dashboard
          </BackButton>
          <PageTitle>₿ Crypto</PageTitle>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw /> Retry
          </RefreshButton>
        </PageHeader>
        <ErrorMessage>{error}</ErrorMessage>
      </CryptoPageContainer>
    );
  }

  return (
    <CryptoPageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>
          <FiArrowLeft /> Back to Dashboard
        </BackButton>
        <PageTitle>₿ Crypto</PageTitle>
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw /> Refresh
        </RefreshButton>
      </PageHeader>

      <CryptoGrid>
        {cryptoData?.cryptocurrencies?.map((coin, index) => (
          <CryptoCard key={index} onClick={() => handleCryptoClick(coin)}>
            <CryptoHeader>
              <CryptoInfo>
                <CryptoIcon>
                  {getCryptoIcon(coin.symbol)}
                </CryptoIcon>
                <CryptoName>
                  <h3>{coin.name}</h3>
                  <span>{coin.symbol}</span>
                </CryptoName>
              </CryptoInfo>
              <PriceChange positive={coin.change_24h >= 0}>
                {coin.change_24h >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2) || '0.00'}%
              </PriceChange>
            </CryptoHeader>
            
            <Price>
              {formatPrice(coin.price)}
            </Price>
            
            <CryptoStats>
              <StatItem>
                <StatLabel>Market Cap</StatLabel>
                <StatValue>{formatMarketCap(coin.market_cap)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>24h Volume</StatLabel>
                <StatValue>{formatMarketCap(coin.volume)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Rank</StatLabel>
                <StatValue>#{coin.rank}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Supply</StatLabel>
                <StatValue>{coin.market_cap && coin.price ? formatMarketCap(coin.market_cap / coin.price) : 'N/A'}</StatValue>
              </StatItem>
            </CryptoStats>
          </CryptoCard>
        ))}
      </CryptoGrid>
    </CryptoPageContainer>
  );
}

export default CryptoPage;
