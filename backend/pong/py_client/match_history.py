import requests

def list_matchhistory_view():
	endpoint = "https://0.0.0.0:8000/matches/"
	get_response = requests.get(endpoint, verify=False)
	print(get_response.status_code)
	print(get_response.json())

def create_matchhistory_view():
	endpoint = "https://0.0.0.0:8000/matches/"
	user_data = {
		"player1": 1,
		"player2": 2,
		"match_score": "10-5",
	}
	post_response = requests.post(endpoint, json=user_data, verify=False)
	print(post_response.status_code)
	print(post_response.json())


create_matchhistory_view()
list_matchhistory_view()