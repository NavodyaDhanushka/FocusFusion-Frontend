//learning plans API
import axios from "axios";

// create axios instance with default config
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

// create learning plan
export const createLearningPlan = async (userId, planData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/learning-plan/user/${userId}`, planData);
};

// get all learning plans
export const getAllLearningPlans = async (token) => {
  const apiClient = createApiClient(token);
  return apiClient.get("/learning-plan");
};

// get learning plan by id
export const getLearningPlanById = async (planId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/learning-plan/${planId}`);
};

// get learning plans by user id
export const getLearningPlansByUserId = async (userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/learning-plan/user/${userId}`);
};

// update learning plan
export const updateLearningPlan = async (planId, planData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.put(`/learning-plan/${planId}`, planData);
};

// delete learning plan
export const deleteLearningPlan = async (planId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/learning-plan/${planId}`);
};

// add like
export const addLike = async (planId, likeData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/learning-plan/${planId}/likes`, likeData);
};

// remove like
export const removeLike = async (planId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/learning-plan/${planId}/likes/${userId}`);
};

// add comment
export const addComment = async (planId, commentData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/learning-plan/${planId}/comments`, commentData);
};

// update comment
export const updateLearningPlanComment = async (planId, commentId, commentData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.put(`/learning-plan/${planId}/comments/${commentId}`, commentData);
};

// delete comment
export const deleteLearningPlanComment = async (planId, commentId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(
    `/learning-plan/${planId}/comments/${commentId}?userId=${userId}`
  );
};

