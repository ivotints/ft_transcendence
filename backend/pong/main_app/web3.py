from web3 import Web3
from django.conf import settings

alchemy_url = settings.ALCHEMY_API_KEY
web3 = Web3(Web3.HTTPProvider(alchemy_url))

if web3.is_connected():
	print("Connected to Ethereum Sepolia")
else:
	print("Failed to connect tp Ethereum Sepolia")

contract_abi = [
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_tournamentID",
				"type": "uint16"
			},
			{
				"internalType": "string[]",
				"name": "_user_names",
				"type": "string[]"
			}
		],
		"name": "addTournament",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isOwner",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_tournamentID",
				"type": "uint16"
			}
		],
		"name": "viewTournament",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

contract_address = "0x1AF16b1e735BeC02179C19D7901c8e9a76DAA348"
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

def get_tournament_data(tournament_id):
	tournament_data = contract.functions.viewTournament(tournament_id).call()
	return tournament_data

def add_tournament_data(tournament_id, winners_order, private_key):
	print("Calling add_tournament_data...")
	tournament_id = int(tournament_id)
	# user_ids = [int(uid) for uid in user_ids]
	account = web3.eth.account.from_key(private_key)
	nonce = web3.eth.get_transaction_count(account.address)
	gas_price = web3.eth.gas_price
	transaction = contract.functions.addTournament(tournament_id, winners_order).build_transaction({
		'from': account.address,
		'nonce': nonce,
		'gas': 200000,
		'gasPrice': gas_price,
	})

	# Signing the transaction
	signed_txn = web3.eth.account.sign_transaction(transaction, private_key=private_key)

	# Sending txn
	tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)

	receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
	if receipt['status'] == 0:
		raise Exception("Transaction failed")

	print(f"Transaction hash: {web3.to_hex(tx_hash)}")
	print(f"Tournament's {tournament_id} data stored on blockchain: {get_tournament_data(tournament_id)}")

	return web3.to_hex(tx_hash)