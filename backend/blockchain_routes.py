from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json

from auth import get_current_user
from blockchain_models import NFTMetadata, NFTTransaction, NFTCollection
from verbwire_service import verbwire_service

# Create Blueprint for blockchain routes
blockchain_bp = Blueprint('blockchain', __name__, url_prefix='/api/blockchain')

@blockchain_bp.route('/health', methods=['GET'])
def blockchain_health():
    """Health check for blockchain module"""
    # Check Verbwire service health
    verbwire_health = verbwire_service.health_check()
    
    return jsonify({
        'status': 'healthy',
        'service': 'blockchain-module',
        'timestamp': datetime.utcnow().isoformat(),
        'verbwire': verbwire_health
    })

@blockchain_bp.route('/mintNFT', methods=['POST'])
@jwt_required()
def mint_nft():
    """Mint a new NFT"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        print(f"DEBUG: Received mint data: {data}")  # Debug log
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'description', 'image_url', 'recipient_address']
        for field in required_fields:
            if not data.get(field):
                print(f"DEBUG: Missing field: {field}")  # Debug log
                return jsonify({'message': f'{field} is required'}), 400
        
        # Extract data
        name = data['name']
        description = data['description']
        image_url = data['image_url']
        recipient_address = data['recipient_address']
        attributes = data.get('attributes', [])
        
        # Mint NFT using Verbwire
        print(f"DEBUG: Calling Verbwire mint_nft with: {name}, {description}, {image_url}, {recipient_address}")
        print(f"DEBUG: Attributes: {attributes}")
        result = verbwire_service.mint_nft(
            recipient_address=recipient_address,
            name=name,
            description=description,
            image_url=image_url,
            attributes=attributes
        )
        
        print(f"DEBUG: Verbwire result: {result}")
        
        if result['success']:
            return jsonify({
                'message': 'NFT minted successfully',
                'nft_id': result['nft_id'],
                'transaction_hash': result['transaction_hash'],
                'token_id': result.get('token_id'),
                'contract_address': result.get('contract_address')
            }), 201
        else:
            print(f"DEBUG: Verbwire error: {result['error']}")
            return jsonify({
                'message': 'Failed to mint NFT',
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({'message': f'Error minting NFT: {str(e)}'}), 500

@blockchain_bp.route('/transferNFT', methods=['POST'])
@jwt_required()
def transfer_nft():
    """Transfer an NFT"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['contract_address', 'token_id', 'from_address', 'to_address']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Transfer NFT using Verbwire
        result = verbwire_service.transfer_nft(
            contract_address=data['contract_address'],
            token_id=data['token_id'],
            from_address=data['from_address'],
            to_address=data['to_address']
        )
        
        if result['success']:
            return jsonify({
                'message': 'NFT transferred successfully',
                'transaction_hash': result['transaction_hash']
            }), 200
        else:
            return jsonify({
                'message': 'Failed to transfer NFT',
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({'message': f'Error transferring NFT: {str(e)}'}), 500

@blockchain_bp.route('/getNFTs', methods=['GET'])
@jwt_required()
def get_nfts():
    """Get NFTs - can filter by wallet or get all"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        wallet_address = request.args.get('wallet')
        
        if wallet_address:
            # Get NFTs from database by wallet
            nfts = NFTMetadata.find_by_owner(wallet_address)
            
            # Also try to get from Verbwire API
            verbwire_result = verbwire_service.get_nfts_by_wallet(wallet_address)
            
            nft_list = [nft.to_dict() for nft in nfts]
            
            response_data = {
                'count': len(nft_list),
                'nfts': nft_list,
                'wallet_address': wallet_address
            }
            
            # Add Verbwire data if available
            if verbwire_result['success']:
                response_data['verbwire_data'] = verbwire_result['data']
            
            return jsonify(response_data), 200
        else:
            # Get all NFTs from database
            nfts = NFTMetadata.find_all()
            nft_list = [nft.to_dict() for nft in nfts]
            
            return jsonify({
                'count': len(nft_list),
                'nfts': nft_list
            }), 200
            
    except Exception as e:
        return jsonify({'message': f'Error getting NFTs: {str(e)}'}), 500

@blockchain_bp.route('/getNFT/<nft_id>', methods=['GET'])
@jwt_required()
def get_nft_details(nft_id):
    """Get details of a specific NFT"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get NFT from database
        nft = NFTMetadata.find_by_id(nft_id)
        if not nft:
            return jsonify({'message': 'NFT not found'}), 404
        
        # Get transactions for this NFT
        transactions = NFTTransaction.find_by_nft_id(nft_id)
        transaction_list = [tx.to_dict() for tx in transactions]
        
        nft_data = nft.to_dict()
        nft_data['transactions'] = transaction_list
        
        return jsonify(nft_data), 200
        
    except Exception as e:
        return jsonify({'message': f'Error getting NFT details: {str(e)}'}), 500

@blockchain_bp.route('/getTransactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get NFT transactions - can filter by wallet or NFT ID"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        wallet_address = request.args.get('wallet')
        nft_id = request.args.get('nft_id')
        
        if wallet_address:
            transactions = NFTTransaction.find_by_wallet(wallet_address)
        elif nft_id:
            transactions = NFTTransaction.find_by_nft_id(nft_id)
        else:
            transactions = NFTTransaction.find_all()
        
        transaction_list = [tx.to_dict() for tx in transactions]
        
        return jsonify({
            'count': len(transaction_list),
            'transactions': transaction_list
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error getting transactions: {str(e)}'}), 500

@blockchain_bp.route('/getCollections', methods=['GET'])
@jwt_required()
def get_collections():
    """Get NFT collections"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        collections = NFTCollection.find_all()
        collection_list = [collection.to_dict() for collection in collections]
        
        return jsonify({
            'count': len(collection_list),
            'collections': collection_list
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error getting collections: {str(e)}'}), 500

@blockchain_bp.route('/deployContract', methods=['POST'])
@jwt_required()
def deploy_contract():
    """Deploy a new NFT contract"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'symbol']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Deploy contract using Verbwire
        result = verbwire_service.deploy_contract(
            name=data['name'],
            symbol=data['symbol'],
            description=data.get('description', '')
        )
        
        if result['success']:
            return jsonify({
                'message': 'Contract deployed successfully',
                'collection_id': result['collection_id'],
                'contract_address': result['contract_address'],
                'transaction_hash': result['transaction_hash']
            }), 201
        else:
            return jsonify({
                'message': 'Failed to deploy contract',
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({'message': f'Error deploying contract: {str(e)}'}), 500

@blockchain_bp.route('/getCollectionNFTs/<contract_address>', methods=['GET'])
@jwt_required()
def get_collection_nfts(contract_address):
    """Get all NFTs in a specific collection"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get collection NFTs using Verbwire
        result = verbwire_service.get_collection_nfts(contract_address)
        
        if result['success']:
            return jsonify({
                'contract_address': contract_address,
                'data': result['data']
            }), 200
        else:
            return jsonify({
                'message': 'Failed to get collection NFTs',
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({'message': f'Error getting collection NFTs: {str(e)}'}), 500

@blockchain_bp.route('/getTransactionStatus/<transaction_hash>', methods=['GET'])
@jwt_required()
def get_transaction_status(transaction_hash):
    """Get status of a blockchain transaction"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get transaction status using Verbwire
        result = verbwire_service.get_transaction_status(transaction_hash)
        
        if result['success']:
            return jsonify({
                'transaction_hash': transaction_hash,
                'data': result['data']
            }), 200
        else:
            return jsonify({
                'message': 'Failed to get transaction status',
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({'message': f'Error getting transaction status: {str(e)}'}), 500

@blockchain_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_blockchain_stats():
    """Get blockchain module statistics"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get counts from database
        total_nfts = len(NFTMetadata.find_all())
        total_transactions = len(NFTTransaction.find_all())
        total_collections = len(NFTCollection.find_all())
        
        return jsonify({
            'total_nfts': total_nfts,
            'total_transactions': total_transactions,
            'total_collections': total_collections,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error getting stats: {str(e)}'}), 500

# Mock data endpoints for development/testing
@blockchain_bp.route('/mock/nfts', methods=['GET'])
def get_mock_nfts():
    """Get mock NFT data for development"""
    mock_nfts = [
        {
            'id': 'mock_nft_1',
            'name': 'Digital Art #001',
            'description': 'Beautiful digital artwork created with AI',
            'image_url': 'https://via.placeholder.com/400x400/6366f1/ffffff?text=NFT+1',
            'owner_wallet': '0x1234...5678',
            'mint_date': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        },
        {
            'id': 'mock_nft_2',
            'name': 'Crypto Collectible #042',
            'description': 'Rare collectible from the OneHub series',
            'image_url': 'https://via.placeholder.com/400x400/10b981/ffffff?text=NFT+2',
            'owner_wallet': '0xabcd...efgh',
            'mint_date': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
    ]
    
    return jsonify({
        'count': len(mock_nfts),
        'nfts': mock_nfts,
        'is_mock': True
    }), 200

@blockchain_bp.route('/mock/transactions', methods=['GET'])
def get_mock_transactions():
    """Get mock transaction data for development"""
    mock_transactions = [
        {
            'id': 'mock_tx_1',
            'nft_id': 'mock_nft_1',
            'action': 'mint',
            'from_wallet': None,
            'to_wallet': '0x1234...5678',
            'tx_id': '0xabc123...def456',
            'status': 'confirmed',
            'timestamp': datetime.utcnow().isoformat()
        },
        {
            'id': 'mock_tx_2',
            'nft_id': 'mock_nft_2',
            'action': 'transfer',
            'from_wallet': '0x1234...5678',
            'to_wallet': '0xabcd...efgh',
            'tx_id': '0xdef789...abc012',
            'status': 'confirmed',
            'timestamp': datetime.utcnow().isoformat()
        }
    ]
    
    return jsonify({
        'count': len(mock_transactions),
        'transactions': mock_transactions,
        'is_mock': True
    }), 200
