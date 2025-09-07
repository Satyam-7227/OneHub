import React, { useState, useEffect } from 'react';
import './CryptoTracker.css';

const CryptoTracker = () => {
    const [cryptoData, setCryptoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('rank');
    const [sortOrder, setSortOrder] = useState('asc');

    const fetchCryptoData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:5000/api/crypto', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch crypto data');
            }

            const data = await response.json();
            setCryptoData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCryptoData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchCryptoData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price) => {
        if (price >= 1) {
            return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            return `$${price.toFixed(6)}`;
        }
    };

    const formatMarketCap = (marketCap) => {
        if (marketCap >= 1e12) {
            return `$${(marketCap / 1e12).toFixed(2)}T`;
        } else if (marketCap >= 1e9) {
            return `$${(marketCap / 1e9).toFixed(2)}B`;
        } else if (marketCap >= 1e6) {
            return `$${(marketCap / 1e6).toFixed(2)}M`;
        } else {
            return `$${marketCap.toLocaleString()}`;
        }
    };

    const formatVolume = (volume) => {
        if (volume >= 1e9) {
            return `$${(volume / 1e9).toFixed(2)}B`;
        } else if (volume >= 1e6) {
            return `$${(volume / 1e6).toFixed(2)}M`;
        } else {
            return `$${volume.toLocaleString()}`;
        }
    };

    const formatPercentage = (percentage) => {
        const formatted = Math.abs(percentage).toFixed(2);
        return percentage >= 0 ? `+${formatted}%` : `-${formatted}%`;
    };

    const sortCryptos = (cryptos) => {
        return [...cryptos].sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'price':
                    aVal = a.price;
                    bVal = b.price;
                    break;
                case 'change':
                    aVal = a.change_24h;
                    bVal = b.change_24h;
                    break;
                case 'marketCap':
                    aVal = a.market_cap;
                    bVal = b.market_cap;
                    break;
                case 'volume':
                    aVal = a.volume;
                    bVal = b.volume;
                    break;
                default:
                    aVal = a.rank;
                    bVal = b.rank;
            }
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    if (loading) {
        return (
            <div className="crypto-tracker">
                <div className="crypto-header">
                    <h1>Crypto Tracker</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading cryptocurrency data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="crypto-tracker">
                <div className="crypto-header">
                    <h1>Crypto Tracker</h1>
                </div>
                <div className="error-container">
                    <p className="error-message">Error: {error}</p>
                    <button onClick={fetchCryptoData} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const sortedCryptos = cryptoData ? sortCryptos(cryptoData.cryptocurrencies) : [];

    return (
        <div className="crypto-tracker">
            <div className="crypto-header">
                <div className="header-info">
                    <h1>Crypto Tracker</h1>
                    {cryptoData && (
                        <div className="market-info">
                            <span className="crypto-count">{cryptoData.count} cryptocurrencies</span>
                            {cryptoData.is_mock && <span className="mock-badge">Demo Data</span>}
                        </div>
                    )}
                </div>
                <button onClick={fetchCryptoData} className="refresh-btn">
                    Refresh
                </button>
            </div>

            {cryptoData && (
                <div className="crypto-table-container">
                    <div className="table-header">
                        <div className="header-cell rank" onClick={() => handleSort('rank')}>
                            Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="header-cell name" onClick={() => handleSort('name')}>
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="header-cell price" onClick={() => handleSort('price')}>
                            Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="header-cell change" onClick={() => handleSort('change')}>
                            24h Change {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="header-cell market-cap" onClick={() => handleSort('marketCap')}>
                            Market Cap {sortBy === 'marketCap' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="header-cell volume" onClick={() => handleSort('volume')}>
                            Volume {sortBy === 'volume' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="header-cell action">
                            Action
                        </div>
                    </div>

                    <div className="crypto-list">
                        {sortedCryptos.map((crypto) => (
                            <div key={crypto.id} className="crypto-row">
                                <div className="crypto-cell rank">#{crypto.rank}</div>
                                <div className="crypto-cell name">
                                    <div className="crypto-info">
                                        {crypto.image && (
                                            <img 
                                                src={crypto.image} 
                                                alt={crypto.name}
                                                className="crypto-logo"
                                            />
                                        )}
                                        <div className="crypto-names">
                                            <span className="crypto-name">{crypto.name}</span>
                                            <span className="crypto-symbol">{crypto.symbol}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="crypto-cell price">
                                    {formatPrice(crypto.price)}
                                </div>
                                <div className={`crypto-cell change ${crypto.change_24h >= 0 ? 'positive' : 'negative'}`}>
                                    {formatPercentage(crypto.change_24h)}
                                </div>
                                <div className="crypto-cell market-cap">
                                    {formatMarketCap(crypto.market_cap)}
                                </div>
                                <div className="crypto-cell volume">
                                    {formatVolume(crypto.volume)}
                                </div>
                                <div className="crypto-cell action">
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => window.open(`https://www.coingecko.com/en/coins/${crypto.id}`, '_blank')}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {cryptoData && (
                <div className="last-updated">
                    Last updated: {new Date(cryptoData.last_updated).toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default CryptoTracker;
