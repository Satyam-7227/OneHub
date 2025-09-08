import React, { useState, useEffect } from 'react';
import './BlockchainPage.css';
import blockchainApiService from '../api/blockchainApi';
import { FiArrowLeft } from 'react-icons/fi';

const BlockchainPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('nfts');
  const [nfts, setNfts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Mint NFT form state
  const [mintForm, setMintForm] = useState({
    name: '',
    description: '',
    image_url: '',
    recipient_address: '',
    attributes: []
  });

  // Transfer NFT form state
  const [transferForm, setTransferForm] = useState({
    contract_address: '',
    token_id: '',
    from_address: '',
    to_address: ''
  });

  // Deploy contract form state
  const [deployForm, setDeployForm] = useState({
    name: '',
    symbol: '',
    description: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchNFTs(),
      fetchTransactions(),
      fetchCollections(),
      fetchStats()
    ]);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    console.log('DEBUG: Using token:', token ? 'Token found' : 'No token found');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchNFTs = async (wallet = '') => {
    try {
      setLoading(true);
      const data = await blockchainApiService.getNFTs(wallet);
      setNfts(data.nfts || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError('Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (wallet = '') => {
    try {
      const filters = wallet ? { wallet } : {};
      const data = await blockchainApiService.getTransactions(filters);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    }
  };

  const fetchCollections = async () => {
    try {
      const data = await blockchainApiService.getCollections();
      console.log('DEBUG: Collections data received:', data);
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await blockchainApiService.getStats();
      console.log('DEBUG: Stats data received:', data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMintNFT = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('DEBUG: Mint form data:', mintForm);
      
      const data = await blockchainApiService.mintNFT(mintForm);
      
      alert('NFT minted successfully!');
      setMintForm({
        name: '',
        description: '',
        image_url: '',
        recipient_address: '',
        attributes: []
      });
      fetchNFTs();
      fetchStats();
    } catch (error) {
      console.error('Error minting NFT:', error);
      console.error('Full error:', error);
      setError(error.message || 'Failed to mint NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferNFT = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await blockchainApiService.transferNFT(transferForm);
      
      alert('NFT transferred successfully!');
      setTransferForm({
        contract_address: '',
        token_id: '',
        from_address: '',
        to_address: ''
      });
      fetchNFTs();
      fetchTransactions();
    } catch (error) {
      console.error('Error transferring NFT:', error);
      setError(error.message || 'Failed to transfer NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployContract = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await blockchainApiService.deployContract(deployForm);
      
      alert('Contract deployed successfully!');
      setDeployForm({
        name: '',
        symbol: '',
        description: ''
      });
      fetchCollections();
    } catch (error) {
      console.error('Error deploying contract:', error);
      setError(error.message || 'Failed to deploy contract');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSearch = (e) => {
    e.preventDefault();
    if (walletAddress.trim()) {
      fetchNFTs(walletAddress.trim());
      fetchTransactions(walletAddress.trim());
    } else {
      fetchNFTs();
      fetchTransactions();
    }
  };

  const renderNFTsTab = () => (
    <div className="blockchain-tab-content">
      <div className="blockchain-search-section">
        <form onSubmit={handleWalletSearch} className="wallet-search-form">
          <input
            type="text"
            placeholder="Enter wallet address to filter NFTs..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="wallet-search-input"
          />
          <button type="submit" className="search-btn">Search</button>
          <button 
            type="button" 
            onClick={() => {
              setWalletAddress('');
              fetchNFTs();
            }}
            className="clear-btn"
          >
            Clear
          </button>
        </form>
      </div>

      <div className="nfts-grid">
        {nfts.length > 0 ? (
          nfts.map((nft, index) => (
            <div key={nft.id || index} className="nft-card">
              <div className="nft-image">
                <img 
                  src={nft.image_url || 'https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT'} 
                  alt={nft.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT';
                  }}
                />
              </div>
              <div className="nft-details">
                <h3>{nft.name}</h3>
                <p className="nft-description">{nft.description}</p>
                <div className="nft-meta">
                  <span className="nft-owner">Owner: {nft.owner_wallet?.substring(0, 10)}...</span>
                  <span className="nft-date">Minted: {new Date(nft.mint_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No NFTs found. {walletAddress ? 'Try a different wallet address.' : 'Mint your first NFT!'}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="blockchain-tab-content">
      <div className="transactions-list">
        {transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <div key={tx.id || index} className="transaction-card">
              <div className="transaction-header">
                <span className={`transaction-action ${tx.action}`}>{tx.action.toUpperCase()}</span>
                <span className={`transaction-status ${tx.status}`}>{tx.status}</span>
              </div>
              <div className="transaction-details">
                {tx.from_wallet && (
                  <p><strong>From:</strong> {tx.from_wallet.substring(0, 20)}...</p>
                )}
                {tx.to_wallet && (
                  <p><strong>To:</strong> {tx.to_wallet.substring(0, 20)}...</p>
                )}
                {tx.tx_id && (
                  <p><strong>TX Hash:</strong> {tx.tx_id.substring(0, 20)}...</p>
                )}
                <p><strong>Date:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMintTab = () => (
    <div className="blockchain-tab-content">
      <form onSubmit={handleMintNFT} className="blockchain-form">
        <h3>Mint New NFT</h3>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={mintForm.name}
            onChange={(e) => setMintForm({...mintForm, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={mintForm.description}
            onChange={(e) => setMintForm({...mintForm, description: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            value={mintForm.image_url}
            onChange={(e) => setMintForm({...mintForm, image_url: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Recipient Address</label>
          <input
            type="text"
            value={mintForm.recipient_address}
            onChange={(e) => setMintForm({...mintForm, recipient_address: e.target.value})}
            placeholder="0x..."
            required
          />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>
      </form>
    </div>
  );

  const renderTransferTab = () => (
    <div className="blockchain-tab-content">
      <form onSubmit={handleTransferNFT} className="blockchain-form">
        <h3>Transfer NFT</h3>
        <div className="form-group">
          <label>Contract Address</label>
          <input
            type="text"
            value={transferForm.contract_address}
            onChange={(e) => setTransferForm({...transferForm, contract_address: e.target.value})}
            placeholder="0x..."
            required
          />
        </div>
        <div className="form-group">
          <label>Token ID</label>
          <input
            type="text"
            value={transferForm.token_id}
            onChange={(e) => setTransferForm({...transferForm, token_id: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>From Address</label>
          <input
            type="text"
            value={transferForm.from_address}
            onChange={(e) => setTransferForm({...transferForm, from_address: e.target.value})}
            placeholder="0x..."
            required
          />
        </div>
        <div className="form-group">
          <label>To Address</label>
          <input
            type="text"
            value={transferForm.to_address}
            onChange={(e) => setTransferForm({...transferForm, to_address: e.target.value})}
            placeholder="0x..."
            required
          />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Transferring...' : 'Transfer NFT'}
        </button>
      </form>
    </div>
  );

  const renderCollectionsTab = () => (
    <div className="blockchain-tab-content">
      <div className="collections-section">
        <form onSubmit={handleDeployContract} className="blockchain-form">
          <h3>Deploy New Collection</h3>
          <div className="form-group">
            <label>Collection Name</label>
            <input
              type="text"
              value={deployForm.name}
              onChange={(e) => setDeployForm({...deployForm, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Symbol</label>
            <input
              type="text"
              value={deployForm.symbol}
              onChange={(e) => setDeployForm({...deployForm, symbol: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={deployForm.description}
              onChange={(e) => setDeployForm({...deployForm, description: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Deploying...' : 'Deploy Contract'}
          </button>
        </form>

        <div className="collections-list">
          <h3>Existing Collections</h3>
          {collections.length > 0 ? (
            collections.map((collection, index) => (
              <div key={collection.id || index} className="collection-card">
                <h4>{collection.name} ({collection.symbol})</h4>
                <p>{collection.description}</p>
                {collection.contract_address && (
                  <p><strong>Contract:</strong> {collection.contract_address.substring(0, 20)}...</p>
                )}
                <p><strong>Creator:</strong> {collection.creator_wallet?.substring(0, 20)}...</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No collections found. Deploy your first collection!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="blockchain-page">
      <div className="blockchain-header">
        <button className="back-button" onClick={onBack}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <h1>🔗 Blockchain & NFTs</h1>
        <p>Manage your NFTs, collections, and blockchain transactions</p>
        
        {Object.keys(stats).length > 0 && (
          <div className="blockchain-stats">
            <div className="stat-card">
              <span className="stat-number">{stats.total_nfts || 0}</span>
              <span className="stat-label">Total NFTs</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.total_transactions || 0}</span>
              <span className="stat-label">Transactions</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.total_collections || 0}</span>
              <span className="stat-label">Collections</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="blockchain-tabs">
        <button 
          className={`tab-btn ${activeTab === 'nfts' ? 'active' : ''}`}
          onClick={() => setActiveTab('nfts')}
        >
          My NFTs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mint' ? 'active' : ''}`}
          onClick={() => setActiveTab('mint')}
        >
          Mint NFT
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          Transfer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          Collections
        </button>
      </div>

      <div className="blockchain-content">
        {loading && <div className="loading-spinner">Loading...</div>}
        
        {activeTab === 'nfts' && renderNFTsTab()}
        {activeTab === 'transactions' && renderTransactionsTab()}
        {activeTab === 'mint' && renderMintTab()}
        {activeTab === 'transfer' && renderTransferTab()}
        {activeTab === 'collections' && renderCollectionsTab()}
      </div>
    </div>
  );
};

export default BlockchainPage;
