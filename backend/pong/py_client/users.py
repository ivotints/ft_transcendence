import requests

def list_users_view():
	endpoint = "https://0.0.0.0:8000/users/"
	get_response = requests.get(endpoint, verify=False)
	print(get_response.status_code)
	print(get_response.json())

def create_view():
	endpoint = "https://0.0.0.0:8000/users/"
	user_data = {
		"email": "test@gmail.com",
		"password_hash": "1123231fjsdjjdsjsfhfhffhfhfdjdddd",
		"display_name": "Jane Williams",
	}
	post_response = requests.post(endpoint, json=user_data, verify=False)
	print(post_response.status_code)
	print(post_response.json())

def list_profiles_view():
	endpoint = "https://0.0.0.0:8000/profiles/"
	get_response = requests.get(endpoint, verify=False)
	print(get_response.status_code)
	print(get_response.json())


create_view()
list_users_view()
list_profiles_view()


