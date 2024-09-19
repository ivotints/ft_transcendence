import requests

def list_users_view():
	endpoint = "https://0.0.0.0:8000/users/"
	get_response = requests.get(endpoint, verify=False)
	print(get_response.status_code)
	print(get_response.json())

def create_view():
	endpoint = "https://0.0.0.0:8000/users/"
	post_response = requests.post(endpoint, json=user_data, verify=False)
	print(post_response.status_code)
	print(post_response.json())

def list_profiles_view():
	endpoint = "https://0.0.0.0:8000/profiles/"
	get_response = requests.get(endpoint, headers=headers, verify=False)
	print(get_response.status_code)
	print(get_response.json())


user_data = {
		"username": "test1",
		# "email": "test@gmail.com",
		"password": "helloworld",
	}
create_view()
auth_response = requests.post("https://0.0.0.0:8000/auth/", json=user_data, verify=False)
print(auth_response.json())

if auth_response.status_code == 200:
	token = auth_response.json()["token"]
	headers = {"Authorization": f"Token {token}"}
	list_users_view()
	list_profiles_view()


