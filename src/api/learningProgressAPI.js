//learning progress API
import axios from "axios";

//create axios instance with default config
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

//create learning progress post
export const createLearningProgress = async (userId, progressData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/learning-progress/user/${userId}`, progressData);
};

//get all learning progress entries
export const getAllLearningProgress = async (token) => {
  const apiClient = createApiClient(token);
  return apiClient.get("/learning-progress");
};

//get learning progress by id
export const getLearningProgressById = async (progressId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/learning-progress/${progressId}`);
};

//get learning progress by user id
export const getLearningProgressByUserId = async (userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/learning-progress/user/${userId}`);
};

//update learning progress
export const updateLearningProgress = async (
  progressId,
  progressData,
  token
) => {
  const apiClient = createApiClient(token);
  return apiClient.put(`/learning-progress/${progressId}`, progressData);
};

//delete learning progress
export const deleteLearningProgress = async (progressId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/learning-progress/${progressId}`);
};

//add like
export const addLike = async (progressId, likeData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/learning-progress/${progressId}/likes`, likeData);
};

//remove like
export const removeLike = async (progressId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/learning-progress/${progressId}/likes/${userId}`);
};

//add comment
export const addComment = async (progressId, commentData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(
    `/learning-progress/${progressId}/comments`,
    commentData
  );
};

//update comment
export const updateLearningProgressComment = async (
  progressId,
  commentId,
  commentData,
  token
) => {
  const apiClient = createApiClient(token);
  return apiClient.put(
    `/learning-progress/${progressId}/comments/${commentId}`,
    commentData
  );
};

//delete comment
export const deleteLearningProgressComment = async (
  progressId,
  commentId,
  userId,
  token
) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(
    `/learning-progress/${progressId}/comments/${commentId}?userId=${userId}`
  );
};
