/*// src/services/apiService.js
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

const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export { loginUser, registerUser };*/


// src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:8081';

const loginUser = async (email, password) => {
  try {
    const response = await axios.get(`${API_URL}/auth`, {
      params: { email, password },
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export { loginUser, registerUser };


/*// src/services/apiService.js
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

export { loginUser };*/