import requests

def list_friends_view():
	endpoint = "https://0.0.0.0:8000/friends/"
	get_response = requests.get(endpoint, verify=False)
	print(get_response.status_code)
	print(get_response.json())

def create_friends_view():
	endpoint = "https://0.0.0.0:8000/friends/"
	user_data = {
		"user": 1,
		"friend": 2,
		"status": "accepted",
	}
	post_response = requests.post(endpoint, json=user_data, verify=False)
	print(post_response.status_code)
	print(post_response.json())


create_friends_view()
list_friends_view()

