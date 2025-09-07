import requests
import json
import os
import base64
from datetime import datetime
from blockchain_models import NFTMetadata, NFTTransaction, NFTCollection

class VerbwireService:
    def __init__(self):
        # Get API keys from environment variables
        self.secret_api_key = os.getenv('VERBWIRE_SECRET_KEY')
        self.public_api_key = os.getenv('VERBWIRE_PUBLIC_KEY')
        self.base_url = "https://api.verbwire.com/v1"
        
        # Validate API keys
        if not self.secret_api_key or not self.public_api_key:
            print("WARNING: Verbwire API keys not found in environment variables")
            print("Please set VERBWIRE_SECRET_KEY and VERBWIRE_PUBLIC_KEY")
        
    def _get_headers(self, use_secret=True):
        """Get headers for API requests"""
        api_key = self.secret_api_key if use_secret else self.public_api_key
        return {
            'accept': 'application/json',
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }
    
    def _validate_api_keys(self):
        """Validate that API keys are available"""
        if not self.secret_api_key or not self.public_api_key:
            return False, "API keys not configured"
        return True, "API keys configured"
    
    def mint_nft(self, recipient_address, name, description, image_url, attributes=None):
        """
        Mint a new NFT using Verbwire API with fallback to mock implementation
        """
        try:
            # Validate API keys
            keys_valid, keys_message = self._validate_api_keys()
            if not keys_valid:
                return self._create_mock_nft(recipient_address, name, description, image_url, attributes)
            
            # Validate input parameters
            if not all([recipient_address, name, description, image_url]):
                return {
                    'success': False,
                    'error': 'Missing required parameters: recipient_address, name, description, image_url'
                }
            
            # Try to mint with Verbwire API
            result = self._attempt_verbwire_mint(recipient_address, name, description, image_url, attributes)
            
            if result['success']:
                return result
            else:
                # Fallback to mock implementation
                print(f"Verbwire minting failed: {result['error']}")
                print("Falling back to mock implementation...")
                return self._create_mock_nft(recipient_address, name, description, image_url, attributes)
                
        except Exception as e:
            print(f"Minting failed: {str(e)}")
            return self._create_mock_nft(recipient_address, name, description, image_url, attributes)
    
    def _attempt_verbwire_mint(self, recipient_address, name, description, image_url, attributes):
        """Attempt to mint NFT using Verbwire API"""
        try:
            # Create metadata
            metadata = {
                "name": name,
                "description": description,
                "image": image_url,
                "attributes": attributes or []
            }
            
            # Try to upload metadata to IPFS
            metadata_url = self._upload_metadata_to_ipfs(metadata)
            if not metadata_url:
                return {
                    'success': False,
                    'error': 'Failed to upload metadata to IPFS'
                }
            
            # Try different minting endpoints
            minting_endpoints = [
                f"{self.base_url}/nft/mint/mintFromMetadata",
                f"{self.base_url}/nft/mint/mint",
                f"{self.base_url}/nft/mint",
                f"{self.base_url}/mint/nft"
            ]
            
            payload = {
                "recipientAddress": recipient_address,
                "data": metadata_url,
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=True)
            
            for url in minting_endpoints:
                try:
                    print(f"DEBUG: Trying minting endpoint: {url}")
                    response = requests.post(url, json=payload, headers=headers, timeout=30)
                    print(f"DEBUG: Response status: {response.status_code}")
                    
                    if response.status_code == 200:
                        result = response.json()
                        return self._save_nft_to_database(name, description, image_url, recipient_address, result)
                    else:
                        print(f"DEBUG: Endpoint {url} failed with status {response.status_code}")
                        continue
                        
                except Exception as e:
                    print(f"DEBUG: Endpoint {url} failed with error: {e}")
                    continue
            
            return {
                'success': False,
                'error': "All Verbwire minting endpoints failed"
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Verbwire minting error: {str(e)}"
            }
    
    def _upload_metadata_to_ipfs(self, metadata):
        """Upload metadata to IPFS with fallback"""
        try:
            # Try different IPFS endpoints
            endpoints = [
                f"{self.base_url}/nft/store/metadataFromJson",
                f"{self.base_url}/nft/store/metadata",
                f"{self.base_url}/nft/upload/metadata",
                f"{self.base_url}/ipfs/upload"
            ]
            
            payload = {
                "metadataJson": metadata
            }
            
            headers = self._get_headers(use_secret=True)
            
            for url in endpoints:
                try:
                    response = requests.post(url, json=payload, headers=headers, timeout=30)
                    if response.status_code == 200:
                        result = response.json()
                        metadata_url = (
                            result.get('ipfs_storage', {}).get('metadataUrl') or
                            result.get('metadataUrl') or
                            result.get('ipfs_url') or
                            result.get('url') or
                            result.get('hash') or
                            result.get('ipfsHash')
                        )
                        
                        if metadata_url:
                            if not metadata_url.startswith('http'):
                                metadata_url = f"https://ipfs.io/ipfs/{metadata_url}"
                            return metadata_url
                except:
                    continue
            
            # Fallback to data URL
            return self._create_fallback_metadata_url(metadata)
                
        except Exception as e:
            return self._create_fallback_metadata_url(metadata)
    
    def _create_fallback_metadata_url(self, metadata):
        """Create a fallback metadata URL for testing"""
        try:
            metadata_json = json.dumps(metadata)
            encoded_metadata = base64.b64encode(metadata_json.encode()).decode()
            return f"data:application/json;base64,{encoded_metadata}"
        except:
            return None
    
    def _create_mock_nft(self, recipient_address, name, description, image_url, attributes):
        """Create a mock NFT for testing purposes"""
        try:
            # Save NFT metadata to database
            nft = NFTMetadata(
                name=name,
                description=description,
                image_url=image_url,
                owner_wallet=recipient_address,
                mint_date=datetime.utcnow()
            )
            nft.save()
            
            # Save transaction record
            transaction = NFTTransaction(
                nft_id=nft._id,
                action='mint',
                to_wallet=recipient_address,
                tx_id=f"mock_tx_{datetime.utcnow().timestamp()}",
                status='confirmed'
            )
            transaction.save()
            
            return {
                'success': True,
                'nft_id': nft.get_id(),
                'transaction_hash': transaction.tx_id,
                'token_id': str(nft._id),
                'contract_address': 'mock_contract',
                'data': {
                    'message': 'Mock NFT created for testing',
                    'is_mock': True
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Mock NFT creation failed: {str(e)}"
            }
    
    def _save_nft_to_database(self, name, description, image_url, recipient_address, verbwire_result):
        """Save NFT to database after successful Verbwire minting"""
        try:
            # Save NFT metadata to database
            nft = NFTMetadata(
                name=name,
                description=description,
                image_url=image_url,
                owner_wallet=recipient_address,
                mint_date=datetime.utcnow()
            )
            nft.save()
            
            # Save transaction record
            transaction = NFTTransaction(
                nft_id=nft._id,
                action='mint',
                to_wallet=recipient_address,
                tx_id=verbwire_result.get('transactionHash'),
                status='confirmed'
            )
            transaction.save()
            
            return {
                'success': True,
                'nft_id': nft.get_id(),
                'transaction_hash': verbwire_result.get('transactionHash'),
                'token_id': verbwire_result.get('tokenId'),
                'contract_address': verbwire_result.get('contractAddress'),
                'data': verbwire_result
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Database save failed: {str(e)}"
            }
    
    def transfer_nft(self, contract_address, token_id, from_address, to_address):
        """Transfer an NFT with fallback to mock implementation"""
        try:
            # Try Verbwire API first
            result = self._attempt_verbwire_transfer(contract_address, token_id, from_address, to_address)
            
            if result['success']:
                return result
            else:
                # Fallback to mock implementation
                return self._create_mock_transfer(contract_address, token_id, from_address, to_address)
                
        except Exception as e:
            return self._create_mock_transfer(contract_address, token_id, from_address, to_address)
    
    def _attempt_verbwire_transfer(self, contract_address, token_id, from_address, to_address):
        """Attempt to transfer NFT using Verbwire API"""
        try:
            url = f"{self.base_url}/nft/transfer"
            payload = {
                "contractAddress": contract_address,
                "tokenId": token_id,
                "fromAddress": from_address,
                "toAddress": to_address,
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=True)
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # Update NFT owner in database
                nft = NFTMetadata.find_by_id(token_id)
                if nft:
                    nft.owner_wallet = to_address
                    nft.updated_at = datetime.utcnow()
                    nft.save()
                    
                    # Save transaction record
                    transaction = NFTTransaction(
                        nft_id=nft._id,
                        action='transfer',
                        from_wallet=from_address,
                        to_wallet=to_address,
                        tx_id=result.get('transactionHash'),
                        status='confirmed'
                    )
                    transaction.save()
                
                return {
                    'success': True,
                    'transaction_hash': result.get('transactionHash'),
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'error': f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Transfer failed: {str(e)}"
            }
    
    def _create_mock_transfer(self, contract_address, token_id, from_address, to_address):
        """Create a mock transfer for testing"""
        try:
            # Update NFT owner in database
            nft = NFTMetadata.find_by_id(token_id)
            if nft:
                nft.owner_wallet = to_address
                nft.updated_at = datetime.utcnow()
                nft.save()
                
                # Save transaction record
                transaction = NFTTransaction(
                    nft_id=nft._id,
                    action='transfer',
                    from_wallet=from_address,
                    to_wallet=to_address,
                    tx_id=f"mock_transfer_{datetime.utcnow().timestamp()}",
                    status='confirmed'
                )
                transaction.save()
                
                return {
                    'success': True,
                    'transaction_hash': transaction.tx_id,
                    'data': {
                        'message': 'Mock transfer completed',
                        'is_mock': True
                    }
                }
            else:
                return {
                    'success': False,
                    'error': 'NFT not found'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Mock transfer failed: {str(e)}"
            }
    
    def get_nft_details(self, contract_address, token_id):
        """Get NFT details with fallback to database"""
        try:
            # Try Verbwire API first
            result = self._attempt_verbwire_nft_details(contract_address, token_id)
            
            if result['success']:
                return result
            else:
                # Fallback to database
                nft = NFTMetadata.find_by_id(token_id)
                if nft:
                    return {
                        'success': True,
                        'data': nft.to_dict()
                    }
                else:
                    return {
                        'success': False,
                        'error': 'NFT not found'
                    }
                    
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to get NFT details: {str(e)}"
            }
    
    def _attempt_verbwire_nft_details(self, contract_address, token_id):
        """Attempt to get NFT details from Verbwire API"""
        try:
            url = f"{self.base_url}/nft/data/nftDetails"
            params = {
                "contractAddress": contract_address,
                "tokenId": token_id,
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=False)
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'error': f"API Error: {response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"API call failed: {str(e)}"
            }
    
    def get_nfts_by_wallet(self, wallet_address):
        """Get NFTs by wallet with fallback to database"""
        try:
            # Try Verbwire API first
            result = self._attempt_verbwire_wallet_nfts(wallet_address)
            
            if result['success']:
                return result
            else:
                # Fallback to database
                nfts = NFTMetadata.find_by_owner(wallet_address)
                nft_list = [nft.to_dict() for nft in nfts]
                
                return {
                    'success': True,
                    'data': {
                        'nfts': nft_list,
                        'count': len(nft_list),
                        'source': 'database'
                    }
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to get wallet NFTs: {str(e)}"
            }
    
    def _attempt_verbwire_wallet_nfts(self, wallet_address):
        """Attempt to get NFTs from Verbwire API"""
        try:
            url = f"{self.base_url}/nft/data/nftsByWallet"
            params = {
                "walletAddress": wallet_address,
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=False)
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'error': f"API Error: {response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"API call failed: {str(e)}"
            }
    
    def get_collection_nfts(self, contract_address):
        """Get collection NFTs with fallback"""
        try:
            url = f"{self.base_url}/nft/data/nftsByContract"
            params = {
                "contractAddress": contract_address,
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=False)
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'error': f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to get collection NFTs: {str(e)}"
            }
    
    def deploy_contract(self, name, symbol, description=""):
        """Deploy contract with fallback to mock"""
        try:
            # Try Verbwire API first
            result = self._attempt_verbwire_deploy(name, symbol, description)
            
            if result['success']:
                return result
            else:
                # Fallback to mock deployment
                return self._create_mock_contract(name, symbol, description)
                
        except Exception as e:
            return self._create_mock_contract(name, symbol, description)
    
    def _attempt_verbwire_deploy(self, name, symbol, description):
        """Attempt to deploy contract using Verbwire API"""
        try:
            url = f"{self.base_url}/nft/deploy/deployContract"
            payload = {
                "contractName": name,
                "contractSymbol": symbol,
                "contractDescription": description,
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=True)
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # Save collection to database
                collection = NFTCollection(
                    name=name,
                    description=description,
                    creator_wallet="",
                    contract_address=result.get('contractAddress')
                )
                collection.save()
                
                return {
                    'success': True,
                    'collection_id': collection.get_id(),
                    'contract_address': result.get('contractAddress'),
                    'transaction_hash': result.get('transactionHash'),
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'error': f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Deployment failed: {str(e)}"
            }
    
    def _create_mock_contract(self, name, symbol, description):
        """Create a mock contract for testing"""
        try:
            collection = NFTCollection(
                name=name,
                description=description,
                creator_wallet="mock_creator",
                contract_address=f"mock_contract_{datetime.utcnow().timestamp()}"
            )
            collection.save()
            
            return {
                'success': True,
                'collection_id': collection.get_id(),
                'contract_address': collection.contract_address,
                'transaction_hash': f"mock_deploy_{datetime.utcnow().timestamp()}",
                'data': {
                    'message': 'Mock contract deployed',
                    'is_mock': True
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Mock deployment failed: {str(e)}"
            }
    
    def get_transaction_status(self, transaction_hash):
        """Get transaction status with fallback"""
        try:
            url = f"{self.base_url}/nft/data/transactionStatus"
            params = {
                "transactionHash": transaction_hash,
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=False)
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'data': result
                }
            else:
                # Fallback to mock status
                return {
                    'success': True,
                    'data': {
                        'status': 'confirmed',
                        'transactionHash': transaction_hash,
                        'is_mock': True
                    }
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to get transaction status: {str(e)}"
            }
    
    def health_check(self):
        """Check if the Verbwire service is properly configured"""
        try:
            keys_valid, keys_message = self._validate_api_keys()
            if not keys_valid:
                return {
                    'status': 'unhealthy',
                    'error': keys_message,
                    'fallback_available': True
                }
            
            # Try a simple API call to test connectivity
            url = f"{self.base_url}/nft/data/nftsByWallet"
            params = {
                "walletAddress": "0x0000000000000000000000000000000000000000",
                "chain": "sepolia"
            }
            
            headers = self._get_headers(use_secret=False)
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code in [200, 400, 404]:
                return {
                    'status': 'healthy',
                    'message': 'Verbwire API is accessible',
                    'fallback_available': True
                }
            else:
                return {
                    'status': 'degraded',
                    'error': f'API returned status {response.status_code}',
                    'fallback_available': True
                }
                
        except Exception as e:
            return {
                'status': 'degraded',
                'error': f'Connection failed: {str(e)}',
                'fallback_available': True
            }

# Initialize Verbwire service instance
verbwire_service = VerbwireService()
