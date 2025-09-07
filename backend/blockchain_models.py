import os
from flask_pymongo import PyMongo
from datetime import datetime
from bson import ObjectId
import json

# Import the existing mongo instance
from database import mongo

class NFTMetadata:
    def __init__(self, name, description, image_url, owner_wallet, mint_date=None, _id=None):
        self.name = name
        self.description = description
        self.image_url = image_url
        self.owner_wallet = owner_wallet
        self.mint_date = mint_date or datetime.utcnow()
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self._id = _id

    def get_id(self):
        return str(self._id) if self._id else None

    def to_dict(self):
        return {
            'id': self.get_id(),
            'name': self.name,
            'description': self.description,
            'image_url': self.image_url,
            'owner_wallet': self.owner_wallet,
            'mint_date': self.mint_date.isoformat() if self.mint_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def save(self):
        try:
            nft_data = {
                'name': self.name,
                'description': self.description,
                'image_url': self.image_url,
                'owner_wallet': self.owner_wallet,
                'mint_date': self.mint_date,
                'created_at': self.created_at,
                'updated_at': self.updated_at
            }
            
            if self._id:
                # Update existing NFT
                result = mongo.db.nft_metadata.update_one(
                    {'_id': self._id},
                    {'$set': nft_data}
                )
                return result.modified_count > 0
            else:
                # Create new NFT
                result = mongo.db.nft_metadata.insert_one(nft_data)
                self._id = result.inserted_id
                return True
        except Exception as e:
            print(f"Error saving NFT metadata: {e}")
            return False

    @staticmethod
    def find_by_id(nft_id):
        try:
            if isinstance(nft_id, str):
                nft_id = ObjectId(nft_id)
            
            nft_data = mongo.db.nft_metadata.find_one({'_id': nft_id})
            if nft_data:
                nft = NFTMetadata(
                    nft_data['name'],
                    nft_data['description'],
                    nft_data['image_url'],
                    nft_data['owner_wallet'],
                    nft_data.get('mint_date', datetime.utcnow())
                )
                nft.created_at = nft_data.get('created_at', datetime.utcnow())
                nft.updated_at = nft_data.get('updated_at', datetime.utcnow())
                nft._id = nft_data['_id']
                return nft
            return None
        except Exception as e:
            print(f"Error finding NFT by ID: {e}")
            return None

    @staticmethod
    def find_by_owner(owner_wallet):
        try:
            nfts = []
            nft_docs = mongo.db.nft_metadata.find({'owner_wallet': owner_wallet}).sort('created_at', -1)
            for doc in nft_docs:
                nft = NFTMetadata(
                    doc['name'],
                    doc['description'],
                    doc['image_url'],
                    doc['owner_wallet'],
                    doc.get('mint_date', datetime.utcnow())
                )
                nft.created_at = doc.get('created_at', datetime.utcnow())
                nft.updated_at = doc.get('updated_at', datetime.utcnow())
                nft._id = doc['_id']
                nfts.append(nft)
            return nfts
        except Exception as e:
            print(f"Error finding NFTs by owner: {e}")
            return []

    @staticmethod
    def find_all():
        try:
            nfts = []
            nft_docs = mongo.db.nft_metadata.find().sort('created_at', -1)
            for doc in nft_docs:
                nft = NFTMetadata(
                    doc['name'],
                    doc['description'],
                    doc['image_url'],
                    doc['owner_wallet'],
                    doc.get('mint_date', datetime.utcnow())
                )
                nft.created_at = doc.get('created_at', datetime.utcnow())
                nft.updated_at = doc.get('updated_at', datetime.utcnow())
                nft._id = doc['_id']
                nfts.append(nft)
            return nfts
        except Exception as e:
            print(f"Error finding all NFTs: {e}")
            return []

class NFTTransaction:
    def __init__(self, nft_id, action, from_wallet=None, to_wallet=None, tx_id=None, status='pending', _id=None):
        self.nft_id = nft_id
        self.action = action  # 'mint', 'transfer', 'burn'
        self.from_wallet = from_wallet
        self.to_wallet = to_wallet
        self.tx_id = tx_id
        self.status = status  # 'pending', 'confirmed', 'failed'
        self.timestamp = datetime.utcnow()
        self._id = _id

    def get_id(self):
        return str(self._id) if self._id else None

    def to_dict(self):
        return {
            'id': self.get_id(),
            'nft_id': str(self.nft_id) if self.nft_id else None,
            'action': self.action,
            'from_wallet': self.from_wallet,
            'to_wallet': self.to_wallet,
            'tx_id': self.tx_id,
            'status': self.status,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

    def save(self):
        try:
            tx_data = {
                'nft_id': self.nft_id,
                'action': self.action,
                'from_wallet': self.from_wallet,
                'to_wallet': self.to_wallet,
                'tx_id': self.tx_id,
                'status': self.status,
                'timestamp': self.timestamp
            }
            
            if self._id:
                # Update existing transaction
                result = mongo.db.nft_transactions.update_one(
                    {'_id': self._id},
                    {'$set': tx_data}
                )
                return result.modified_count > 0
            else:
                # Create new transaction
                result = mongo.db.nft_transactions.insert_one(tx_data)
                self._id = result.inserted_id
                return True
        except Exception as e:
            print(f"Error saving NFT transaction: {e}")
            return False

    @staticmethod
    def find_by_nft_id(nft_id):
        try:
            if isinstance(nft_id, str):
                nft_id = ObjectId(nft_id)
            
            transactions = []
            tx_docs = mongo.db.nft_transactions.find({'nft_id': nft_id}).sort('timestamp', -1)
            for doc in tx_docs:
                tx = NFTTransaction(
                    doc['nft_id'],
                    doc['action'],
                    doc.get('from_wallet'),
                    doc.get('to_wallet'),
                    doc.get('tx_id'),
                    doc.get('status', 'pending')
                )
                tx.timestamp = doc.get('timestamp', datetime.utcnow())
                tx._id = doc['_id']
                transactions.append(tx)
            return transactions
        except Exception as e:
            print(f"Error finding transactions by NFT ID: {e}")
            return []

    @staticmethod
    def find_by_wallet(wallet_address):
        try:
            transactions = []
            tx_docs = mongo.db.nft_transactions.find({
                '$or': [
                    {'from_wallet': wallet_address},
                    {'to_wallet': wallet_address}
                ]
            }).sort('timestamp', -1)
            
            for doc in tx_docs:
                tx = NFTTransaction(
                    doc['nft_id'],
                    doc['action'],
                    doc.get('from_wallet'),
                    doc.get('to_wallet'),
                    doc.get('tx_id'),
                    doc.get('status', 'pending')
                )
                tx.timestamp = doc.get('timestamp', datetime.utcnow())
                tx._id = doc['_id']
                transactions.append(tx)
            return transactions
        except Exception as e:
            print(f"Error finding transactions by wallet: {e}")
            return []

    @staticmethod
    def find_all():
        try:
            transactions = []
            tx_docs = mongo.db.nft_transactions.find().sort('timestamp', -1)
            for doc in tx_docs:
                tx = NFTTransaction(
                    doc['nft_id'],
                    doc['action'],
                    doc.get('from_wallet'),
                    doc.get('to_wallet'),
                    doc.get('tx_id'),
                    doc.get('status', 'pending')
                )
                tx.timestamp = doc.get('timestamp', datetime.utcnow())
                tx._id = doc['_id']
                transactions.append(tx)
            return transactions
        except Exception as e:
            print(f"Error finding all transactions: {e}")
            return []

class NFTCollection:
    def __init__(self, name, description, creator_wallet, contract_address=None, _id=None):
        self.name = name
        self.description = description
        self.creator_wallet = creator_wallet
        self.contract_address = contract_address
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self._id = _id

    def get_id(self):
        return str(self._id) if self._id else None

    def to_dict(self):
        return {
            'id': self.get_id(),
            'name': self.name,
            'description': self.description,
            'creator_wallet': self.creator_wallet,
            'contract_address': self.contract_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def save(self):
        try:
            collection_data = {
                'name': self.name,
                'description': self.description,
                'creator_wallet': self.creator_wallet,
                'contract_address': self.contract_address,
                'created_at': self.created_at,
                'updated_at': self.updated_at
            }
            
            if self._id:
                # Update existing collection
                result = mongo.db.nft_collections.update_one(
                    {'_id': self._id},
                    {'$set': collection_data}
                )
                return result.modified_count > 0
            else:
                # Create new collection
                result = mongo.db.nft_collections.insert_one(collection_data)
                self._id = result.inserted_id
                return True
        except Exception as e:
            print(f"Error saving NFT collection: {e}")
            return False

    @staticmethod
    def find_by_id(collection_id):
        try:
            if isinstance(collection_id, str):
                collection_id = ObjectId(collection_id)
            
            collection_data = mongo.db.nft_collections.find_one({'_id': collection_id})
            if collection_data:
                collection = NFTCollection(
                    collection_data['name'],
                    collection_data['description'],
                    collection_data['creator_wallet'],
                    collection_data.get('contract_address')
                )
                collection.created_at = collection_data.get('created_at', datetime.utcnow())
                collection.updated_at = collection_data.get('updated_at', datetime.utcnow())
                collection._id = collection_data['_id']
                return collection
            return None
        except Exception as e:
            print(f"Error finding collection by ID: {e}")
            return None

    @staticmethod
    def find_all():
        try:
            collections = []
            collection_docs = mongo.db.nft_collections.find().sort('created_at', -1)
            for doc in collection_docs:
                collection = NFTCollection(
                    doc['name'],
                    doc['description'],
                    doc['creator_wallet'],
                    doc.get('contract_address')
                )
                collection.created_at = doc.get('created_at', datetime.utcnow())
                collection.updated_at = doc.get('updated_at', datetime.utcnow())
                collection._id = doc['_id']
                collections.append(collection)
            return collections
        except Exception as e:
            print(f"Error finding all collections: {e}")
            return []

def initialize_blockchain_indexes():
    """Initialize MongoDB indexes for blockchain collections"""
    try:
        # Create indexes for better performance
        mongo.db.nft_metadata.create_index("owner_wallet")
        mongo.db.nft_transactions.create_index("nft_id")
        mongo.db.nft_transactions.create_index("from_wallet")
        mongo.db.nft_transactions.create_index("to_wallet")
        mongo.db.nft_transactions.create_index("tx_id", unique=True, sparse=True)
        mongo.db.nft_collections.create_index("creator_wallet")
        mongo.db.nft_collections.create_index("contract_address", unique=True, sparse=True)
        print("Blockchain MongoDB indexes created successfully!")
        return True
    except Exception as e:
        print(f"Error creating blockchain MongoDB indexes: {e}")
        return False
