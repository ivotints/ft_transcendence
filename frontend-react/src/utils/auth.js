import axios from 'axios';

export function refreshToken() {
    axios.post('https://localhost/token/refresh/', {}, {
        withCredentials: true, // Include cookies in the request
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.data.detail === 'Success') {
            console.log('Token refreshed successfully');
        } else {
            console.error('Failed to refresh token:', response.data);
        }
    })
    .catch(error => {
        console.error('Error refreshing token:', error);
    });
}