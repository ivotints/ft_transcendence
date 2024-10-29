import axios from 'axios';

export function refreshToken() {
    axios.post('https://localhost:8000/token/refresh/', {}, {
        withCredentials: true, // Include cookies in the request
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.status === 200) {
            console.log('Token refreshed successfully');
        } else {
            console.error('Failed to refresh token:', response.data);
        }
    })
    .catch(error => {
        console.error('Error refreshing token:', error);
    });
}