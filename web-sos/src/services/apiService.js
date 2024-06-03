// src/services/apiService.js
import axios from 'axios';

const API_URL = 'https://localhost:8081';

const loginUser = async (email, password) => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      params: { email, password },
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export { loginUser };
