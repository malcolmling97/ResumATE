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

// Resume Items API
export const resumeItemsApi = {
  // Get all resume items for the current user (optionally filter by type)
  getUserResumeItems: async (type) => {
    const url = type ? `${API_BASE_URL}/resume-items?type=${type}` : `${API_BASE_URL}/resume-items`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get a single resume item
  getResumeItemById: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/resume-items/${itemId}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Create a new resume item
  createResumeItem: async (itemData) => {
    const response = await fetch(`${API_BASE_URL}/resume-items`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    return handleResponse(response);
  },

  // Update a resume item
  updateResumeItem: async (itemId, itemData) => {
    const response = await fetch(`${API_BASE_URL}/resume-items/${itemId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    return handleResponse(response);
  },

  // Delete a resume item
  deleteResumeItem: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/resume-items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get bullet points for a resume item
  getResumeItemPoints: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/resume-items/${itemId}/points`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Create a bullet point
  createResumeItemPoint: async (pointData) => {
    const response = await fetch(`${API_BASE_URL}/resume-items/points`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pointData),
    });
    return handleResponse(response);
  },

  // Update a bullet point
  updateResumeItemPoint: async (pointId, pointData) => {
    const response = await fetch(`${API_BASE_URL}/resume-items/points/${pointId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pointData),
    });
    return handleResponse(response);
  },

  // Delete a bullet point
  deleteResumeItemPoint: async (pointId) => {
    const response = await fetch(`${API_BASE_URL}/resume-items/points/${pointId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  }
};

// Resume Generation API
export const resumeApi = {
  // Generate a tailored resume from job description
  generateResume: async (data) => {
    const response = await fetch(`${API_BASE_URL}/resume/generate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};
