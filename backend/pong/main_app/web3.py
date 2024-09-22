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
				"internalType": "uint16[]",
				"name": "_userIDs",
				"type": "uint16[]"
			}
		],
		"name": "addTournament",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"internalType": "uint16[]",
				"name": "",
				"type": "uint16[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

contract_address = "0x43cb1803106fd9baCdf03183f079C3071E9FC1A2"
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

def get_tournament_data(tournament_id):
	tournament_data = contract.functions.viewTournament(tournament_id).call()
	return tournament_data

def add_tournament_data(tournament_id, user_ids, private_key):
	tournament_id = int(tournament_id)
	user_ids = [int(uid) for uid in user_ids]
	account = web3.eth.account.from_key(private_key)
	nonce = web3.eth.get_transaction_count(account.address)
	transaction = contract.functions.addTournament(tournament_id, user_ids).build_transaction({
		'from': account.address,
		'nonce': nonce,
		'gas': 88224,
		'gasPrice': web3.to_wei('20', 'gwei'),
	})

	# Signing the transaction
	signed_txn = web3.eth.account.sign_transaction(transaction, private_key=private_key)

	# Sending txn
	tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)

	receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
	if receipt['status'] == 0:
		raise Exception("Transaction failed")

	return web3.to_hex(tx_hash)