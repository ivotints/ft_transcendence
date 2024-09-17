import requests

def list_tournament_view():
	endpoint = "https://0.0.0.0:8000/tournaments/"
	get_response = requests.get(endpoint, verify=False)
	print(get_response.status_code)
	print(get_response.json())

def create_tournament_view():
	endpoint = "https://0.0.0.0:8000/tournaments/"
	user_data = {
		"name": "League 1",
		"blockchain_tx_hash": "0x2333dddssss",
	}
	post_response = requests.post(endpoint, json=user_data, verify=False)
	print(post_response.status_code)
	print(post_response.json())


create_tournament_view()
list_tournament_view()