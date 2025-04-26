import axios from "axios";

// Create axios instance with default config
const createApiClient = (token) => {
  const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    timeout: 60000, // 60 seconds
  });

  return apiClient;
};

// Get user profile
export const getUserProfile = async (userId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/user/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.put(
      `/user/profile/${userId}`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Follow a user
export const followUser = async (userId, token) => {
  const apiClient = createApiClient(token);
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  if (!currentUserId) {
    throw new Error("User not authenticated");
  }

  try {
    const response = await apiClient.post(
      `/user/${userId}/follow?followerId=${currentUserId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (userId, token) => {
  const apiClient = createApiClient(token);
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  if (!currentUserId) {
    throw new Error("User not authenticated");
  }

  try {
    const response = await apiClient.post(
      `/user/${userId}/unfollow?followerId=${currentUserId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};

// Get multiple users by IDs
export const getUsersById = async (userIds, token) => {
  const apiClient = createApiClient(token);
  try {
    const userIdsString = userIds.join(",");
    const response = await apiClient.get(`/user/batch?ids=${userIdsString}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Get user's content (posts, progress, plans)
export const getUserContent = async (userId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/user/${userId}/content`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user content:", error);
    throw error;
  }
};

// Additional API functions for posts, progress, and plans
export const getUserPosts = async (userId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/posts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

export const getUserLearningProgress = async (userId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/learning-progress/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user learning progress:", error);
    throw error;
  }
};

export const getUserLearningPlans = async (userId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/learning-plan/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user learning plans:", error);
    throw error;
  }
};

export const getUserTotalPostCount = async (userId, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/user/${userId}/post/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user learning plans:", error);
    throw error;
  }
};