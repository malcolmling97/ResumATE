const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  credentials: 'include',
});

// Auth API
export const authApi = {
  // Sign out user
  signOut: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Verify user session
  verifyUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Delete user account
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/delete/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get current user data
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Update user profile
  updateUser: async (userId, updates) => {
    const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }
};

// Education API
export const educationApi = {
  // Get all education entries for the current user
  getUserEducation: async () => {
    const response = await fetch(`${API_BASE_URL}/education`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get a single education entry
  getEducationById: async (educationId) => {
    const response = await fetch(`${API_BASE_URL}/education/${educationId}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Create a new education entry
  createEducation: async (educationData) => {
    const response = await fetch(`${API_BASE_URL}/education`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(educationData),
    });
    return handleResponse(response);
  },

  // Update an education entry
  updateEducation: async (educationId, educationData) => {
    const response = await fetch(`${API_BASE_URL}/education/${educationId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(educationData),
    });
    return handleResponse(response);
  },

  // Delete an education entry
  deleteEducation: async (educationId) => {
    const response = await fetch(`${API_BASE_URL}/education/${educationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  }
};

// Skills API
export const skillsApi = {
  // Get all skills for the current user
  getUserSkills: async () => {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get a single skill entry
  getSkillById: async (skillId) => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Create a new skill entry
  createSkill: async (skillData) => {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData),
    });
    return handleResponse(response);
  },

  // Update a skill entry
  updateSkill: async (skillId, skillData) => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData),
    });
    return handleResponse(response);
  },

  // Delete a skill entry
  deleteSkill: async (skillId) => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  }
};
