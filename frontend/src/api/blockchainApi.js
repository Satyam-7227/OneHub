// Blockchain API service for frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class BlockchainApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/blockchain`;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.log('API Error Response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Mint a new NFT
  async mintNFT(nftData) {
    try {
      console.log('DEBUG: Sending mint request to:', `${this.baseURL}/mintNFT`);
      console.log('DEBUG: NFT data:', nftData);
      console.log('DEBUG: Headers:', this.getAuthHeaders());
      
      const response = await fetch(`${this.baseURL}/mintNFT`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(nftData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  // Transfer an NFT
  async transferNFT(transferData) {
    try {
      const response = await fetch(`${this.baseURL}/transferNFT`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(transferData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }

  // Get NFTs (optionally filtered by wallet)
  async getNFTs(walletAddress = '') {
    try {
      const url = walletAddress 
        ? `${this.baseURL}/getNFTs?wallet=${encodeURIComponent(walletAddress)}`
        : `${this.baseURL}/getNFTs`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      // Fallback to mock data
      return this.getMockNFTs();
    }
  }

  // Get NFT details by ID
  async getNFTDetails(nftId) {
    try {
      const response = await fetch(`${this.baseURL}/getNFT/${nftId}`, {
        headers: this.getAuthHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      throw error;
    }
  }

  // Get transactions (optionally filtered by wallet or NFT ID)
  async getTransactions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.wallet) params.append('wallet', filters.wallet);
      if (filters.nft_id) params.append('nft_id', filters.nft_id);
      
      const url = `${this.baseURL}/getTransactions${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to mock data
      return this.getMockTransactions();
    }
  }

  // Get collections
  async getCollections() {
    try {
      const response = await fetch(`${this.baseURL}/getCollections`, {
        headers: this.getAuthHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching collections:', error);
      return { count: 0, collections: [] };
    }
  }

  // Deploy a new contract
  async deployContract(contractData) {
    try {
      const response = await fetch(`${this.baseURL}/deployContract`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(contractData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deploying contract:', error);
      throw error;
    }
  }

  // Get collection NFTs
  async getCollectionNFTs(contractAddress) {
    try {
      const response = await fetch(`${this.baseURL}/getCollectionNFTs/${contractAddress}`, {
        headers: this.getAuthHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching collection NFTs:', error);
      throw error;
    }
  }

  // Get transaction status
  async getTransactionStatus(transactionHash) {
    try {
      const response = await fetch(`${this.baseURL}/getTransactionStatus/${transactionHash}`, {
        headers: this.getAuthHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      throw error;
    }
  }

  // Get blockchain stats
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        headers: this.getAuthHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
      return {
        total_nfts: 0,
        total_transactions: 0,
        total_collections: 0
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Blockchain service health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Mock data fallbacks
  getMockNFTs() {
    return {
      count: 2,
      nfts: [
        {
          id: 'mock_nft_1',
          name: 'Digital Art #001',
          description: 'Beautiful digital artwork created with AI',
          image_url: 'https://via.placeholder.com/400x400/6366f1/ffffff?text=NFT+1',
          owner_wallet: '0x1234...5678',
          mint_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock_nft_2',
          name: 'Crypto Collectible #042',
          description: 'Rare collectible from the OneHub series',
          image_url: 'https://via.placeholder.com/400x400/10b981/ffffff?text=NFT+2',
          owner_wallet: '0xabcd...efgh',
          mint_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      is_mock: true
    };
  }

  getMockTransactions() {
    return {
      count: 2,
      transactions: [
        {
          id: 'mock_tx_1',
          nft_id: 'mock_nft_1',
          action: 'mint',
          from_wallet: null,
          to_wallet: '0x1234...5678',
          tx_id: '0xabc123...def456',
          status: 'confirmed',
          timestamp: new Date().toISOString()
        },
        {
          id: 'mock_tx_2',
          nft_id: 'mock_nft_2',
          action: 'transfer',
          from_wallet: '0x1234...5678',
          to_wallet: '0xabcd...efgh',
          tx_id: '0xdef789...abc012',
          status: 'confirmed',
          timestamp: new Date().toISOString()
        }
      ],
      is_mock: true
    };
  }
}

// Export singleton instance
const blockchainApiService = new BlockchainApiService();
export default blockchainApiService;
