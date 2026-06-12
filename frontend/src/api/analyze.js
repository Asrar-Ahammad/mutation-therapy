import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const analyzeMutation = async (mutation) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      mutation: mutation
    });
    return response.data;
  } catch (error) {
    console.error("Error analyzing mutation:", error);
    throw error;
  }
};
