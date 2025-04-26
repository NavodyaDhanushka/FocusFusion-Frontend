import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, UserPlus, UserMinus, AlertCircle } from "lucide-react";
import { useAuth } from "../context/auth";
import ProfileLayout from "../layout/ProfileLayout";
import SkillSharingCard from "../components/SkillSharingCard";
import LearningProgressCard from "../components/LearningProgressCard";
import LearningPlanCard from "../components/LearningPlanCard";
import EditProfileModal from "../components/EditProfileModal";
import FollowersModal from "../components/FollowersModal";
import EditLearningProgressModal from "../components/EditLearningProgressModal";
import EditLearningPlanModal from "../components/EditLearningPlanModal";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

// API imports
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getUserTotalPostCount,
} from "../api/profileAPI";
import {
  deletePost,
  addLike,
  removeLike,
  getPostsByUserId,
  addComment as addPostComment,
  updateComment as updatePostComment,
  deleteComment as deletePostComment,
} from "../api/skillSharingAPI";
import {
  deleteLearningProgress,
  addLike as addProgressLike,
  removeLike as removeProgressLike,
  getLearningProgressByUserId,
  addComment as addProgressComment,
  updateLearningProgressComment,
  deleteLearningProgressComment,
} from "../api/learningProgressAPI";
import {
  deleteLearningPlan,
  addLike as addPlanLike,
  removeLike as removePlanLike,
  getLearningPlansByUserId,
  addComment as addPlanComment,
  updateLearningPlanComment,
  deleteLearningPlanComment,
} from "../api/learningPlanAPI";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { modalState, openModal, closeModal } = useConfirmModal();

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("progress");
  const [posts, setPosts] = useState([]);
  const [progressEntries, setProgressEntries] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [editingProgress, setEditingProgress] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile data
        const profileData = await getUserProfile(userId);
        setProfileUser(profileData);

        // Check if current user is the profile owner
        setIsOwner(currentUser?.id === userId);

        // Check if current user is following this profile
        setIsFollowing(
          currentUser?.followingUsers?.includes(userId) ||
            profileData.followedUsers?.includes(currentUser?.id)
        );

        // Fetch total post count
        const postCountData = await getUserTotalPostCount(
          userId,
          currentUser?.token
        );
        setTotalPostCount(postCountData.totalPosts);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser]);

  useEffect(() => {
    // Fetch content based on active tab
    const fetchContent = async () => {
      if (!profileUser) return;

      setContentLoading(true);
      try {
        let postsData;
        let progressData;
        let plansData;

        switch (activeTab) {
          case "posts":
            postsData = await getPostsByUserId(userId, currentUser?.token);
            setPosts(postsData.data || []);
            break;
          case "progress":
            progressData = await getLearningProgressByUserId(
              userId,
              currentUser?.token
            );
            setProgressEntries(progressData.data || []);
            break;
          case "plans":
            plansData = await getLearningPlansByUserId(
              userId,
              currentUser?.token
            );
            setLearningPlans(plansData.data || []);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
        toast.error(`Failed to load ${activeTab}`);
      } finally {
        setContentLoading(false);
      }
    };

    fetchContent();
  }, [activeTab, profileUser, userId, currentUser?.token]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to follow users");
      navigate("/login");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(userId, currentUser?.token);
        toast.success(`Unfollowed ${profileUser.name}`);
      } else {
        await followUser(userId, currentUser?.token);
        toast.success(`Now following ${profileUser.name}`);
      }

      // Toggle following state
      setIsFollowing(!isFollowing);

      // Update followers count in profile data
      setProfileUser((prev) => ({
        ...prev,
        followedUsers: isFollowing
          ? (prev.followedUsers || []).filter((id) => id !== currentUser?.id)
          : [...(prev.followedUsers || []), currentUser?.id],
      }));
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error("Failed to update follow status");
    }
  };

  const handleProfileUpdated = (updatedProfile) => {
    setProfileUser(updatedProfile);
    setShowEditProfile(false);
    toast.success("Profile updated successfully");
  };

  // Comment handlers for posts
  const handleAddPostComment = async (postId, commentData) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      navigate("/login");
      return false;
    }

    try {
      const response = await addPostComment(
        postId,
        commentData,
        currentUser.token
      );

      // Update posts state directly with the response data
      setPosts(
        posts.map((post) => (post.id === postId ? response.data : post))
      );

      return response;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      throw error;
    }
  };

  const handleUpdatePostComment = (postId, commentId, newContent) => {
    // Update the comment directly in the state
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  content: newContent,
                  updatedAt: new Date(),
                };
              }
              return comment;
            }),
          };
        }
        return post;
      })
    );
  };

  const handleDeletePostComment = (postId, commentId) => {
    // Remove the comment from the state
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(
              (comment) => comment.id !== commentId
            ),
          };
        }
        return post;
      })
    );
  };

  // Progress comment handlers
  const handleAddProgressComment = async (progressId, commentData) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      navigate("/login");
      return false;
    }

    try {
      await addProgressComment(progressId, commentData, currentUser.token);

      // Refresh progress entries to get the updated comments
      const progressData = await getLearningProgressByUserId(
        userId,
        currentUser?.token
      );
      setProgressEntries(progressData.data || []);

      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return false;
    }
  };

  const handleUpdateProgressComment = async (
    progressId,
    commentId,
    updatedContent
  ) => {
    try {
      const updatedComment = {
        id: commentId,
        content: updatedContent,
      };
      await updateLearningProgressComment(
        progressId,
        commentId,
        updatedComment,
        currentUser.token
      );

      // Refresh progress entries to get the updated comments
      const progressData = await getLearningProgressByUserId(
        userId,
        currentUser?.token
      );
      setProgressEntries(progressData.data || []);

      return true;
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
      return false;
    }
  };

  const handleDeleteProgressComment = async (progressId, commentId) => {
    try {
      await deleteLearningProgressComment(
        progressId,
        commentId,
        currentUser.id,
        currentUser.token
      );

      // Refresh progress entries to get the updated comments
      const progressData = await getLearningProgressByUserId(
        userId,
        currentUser?.token
      );
      setProgressEntries(progressData.data || []);

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      return false;
    }
  };

  // Plan comment handlers
  const handleAddPlanComment = async (planId, commentData) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      navigate("/login");
      return false;
    }

    try {
      await addPlanComment(planId, commentData, currentUser.token);

      // Refresh plans to get the updated comments
      const plansData = await getLearningPlansByUserId(
        userId,
        currentUser?.token
      );
      setLearningPlans(plansData.data || []);

      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return false;
    }
  };

  const handleUpdatePlanComment = async (planId, commentId, updatedContent) => {
    try {
      const updatedComment = {
        id: commentId,
        content: updatedContent,
      };
      await updateLearningPlanComment(
        planId,
        commentId,
        updatedComment,
        currentUser.token
      );

      // Refresh plans to get the updated comments
      const plansData = await getLearningPlansByUserId(
        userId,
        currentUser?.token
      );
      setLearningPlans(plansData.data || []);

      return true;
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
      return false;
    }
  };

  const handleDeletePlanComment = async (planId, commentId) => {
    try {
      await deleteLearningPlanComment(
        planId,
        commentId,
        currentUser.id,
        currentUser.token
      );

      // Refresh plans to get the updated comments
      const plansData = await getLearningPlansByUserId(
        userId,
        currentUser?.token
      );
      setLearningPlans(plansData.data || []);

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      return false;
    }
  };

  const handleDeletePost = async (postId, isUpdate = false) => {
    if (isUpdate) {
      // If this is called after a post update, refresh the posts data
      try {
        const postsData = await getPostsByUserId(userId, currentUser?.token);
        setPosts(postsData.data || []);
        return; // Don't show toast here since it's coming from EditPostModal
      } catch (error) {
        console.error("Error refreshing posts:", error);
        toast.error("Failed to refresh posts");
        return;
      }
    }

    // Normal delete flow
    openModal({
      title: "Delete Post",
      message:
        "Are you sure you want to delete this post? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deletePost(postId, currentUser?.token);
          setPosts(posts.filter((post) => post.id !== postId));
          // Update total post count after successful deletion
          setTotalPostCount((prevCount) => Math.max(0, prevCount - 1));
          // Toast is shown by the card component
        } catch (error) {
          console.error("Error deleting post:", error);
          toast.error("Failed to delete post");
        }
      },
    });
  };

  const handleLikePost = async (postId) => {
    if (!currentUser) {
      toast.error("You must be logged in to like posts");
      navigate("/login");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    const isLiked = post?.likes?.some(
      (like) => like.userId === currentUser?.id
    );

    // Create a copy of the original posts state for potential rollback
    const originalPosts = [...posts];

    // Update UI immediately
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          if (isLiked) {
            return {
              ...post,
              likes: post.likes.filter(
                (like) => like.userId !== currentUser?.id
              ),
            };
          } else {
            return {
              ...post,
              likes: [
                ...post.likes,
                { userId: currentUser?.id, createdAt: new Date() },
              ],
            };
          }
        }
        return post;
      })
    );

    try {
      // Make the API call after UI is already updated
      if (isLiked) {
        await removeLike(postId, currentUser?.id, currentUser?.token);
      } else {
        const likeData = { userId: currentUser?.id };
        await addLike(postId, likeData, currentUser?.token);
      }
      // If successful, we already updated the UI
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to process like");

      // Revert to original state if API call fails
      setPosts(originalPosts);
    }
  };

  const handleEditProgress = (progress) => {
    setEditingProgress(progress);
  };

  const handleProgressUpdated = async () => {
    // Refresh progress data after update
    try {
      const progressData = await getLearningProgressByUserId(
        userId,
        currentUser?.token
      );
      setProgressEntries(progressData.data || []);
      setEditingProgress(null);
      toast.success("Progress updated successfully");
    } catch (error) {
      console.error("Error refreshing progress data:", error);
      toast.error("Failed to refresh progress data");
    }
  };

  const handleLikeProgress = async (progressId) => {
    if (!currentUser) {
      toast.error("You must be logged in to like progress updates");
      navigate("/login");
      return;
    }

    const progress = progressEntries.find((p) => p.id === progressId);
    const isLiked = progress?.likes?.some(
      (like) => like.userId === currentUser?.id
    );

    try {
      if (isLiked) {
        await removeProgressLike(
          progressId,
          currentUser?.id,
          currentUser?.token
        );
      } else {
        const likeData = { userId: currentUser?.id };
        await addProgressLike(progressId, likeData, currentUser?.token);
      }

      // Update state immediately for better UX
      setProgressEntries(
        progressEntries.map((entry) => {
          if (entry.id === progressId) {
            if (isLiked) {
              return {
                ...entry,
                likes: entry.likes.filter(
                  (like) => like.userId !== currentUser?.id
                ),
              };
            } else {
              return {
                ...entry,
                likes: [
                  ...entry.likes,
                  { userId: currentUser?.id, createdAt: new Date() },
                ],
              };
            }
          }
          return entry;
        })
      );

      // Show feedback toast
      toast.success(isLiked ? "Progress unliked" : "Progress liked");
    } catch (error) {
      console.error("Error toggling progress like:", error);
      toast.error("Failed to process like");

      // Refresh progress data to ensure UI is in sync with server
      const progressData = await getLearningProgressByUserId(
        userId,
        currentUser?.token
      );
      setProgressEntries(progressData.data || []);
    }
  };

  const handleDeleteProgress = async (progressId) => {
    openModal({
      title: "Delete Progress",
      message:
        "Are you sure you want to delete this progress update? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteLearningProgress(progressId, currentUser?.token);
          setProgressEntries(
            progressEntries.filter((progress) => progress.id !== progressId)
          );
          // Update total post count after successful deletion
          setTotalPostCount((prevCount) => Math.max(0, prevCount - 1));
          toast.success("Progress deleted successfully");
        } catch (error) {
          console.error("Error deleting progress:", error);
          toast.error("Failed to delete progress");
        }
      },
    });
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
  };

  const handlePlanUpdated = async () => {
    // Refresh plan data after update
    try {
      const plansData = await getLearningPlansByUserId(
        userId,
        currentUser?.token
      );
      setLearningPlans(plansData.data || []);
      setEditingPlan(null);
      toast.success("Plan updated successfully");
    } catch (error) {
      console.error("Error refreshing plan data:", error);
      toast.error("Failed to refresh plan data");
    }
  };

  const handleLikePlan = async (planId) => {
    if (!currentUser) {
      toast.error("You must be logged in to like learning plans");
      navigate("/login");
      return;
    }

    const plan = learningPlans.find((p) => p.id === planId);
    const isLiked = plan?.likes?.some(
      (like) => like.userId === currentUser?.id
    );

    try {
      if (isLiked) {
        await removePlanLike(planId, currentUser?.id, currentUser?.token);
      } else {
        const likeData = { userId: currentUser?.id };
        await addPlanLike(planId, likeData, currentUser?.token);
      }

      // Update state immediately for better UX
      setLearningPlans(
        learningPlans.map((plan) => {
          if (plan.id === planId) {
            if (isLiked) {
              return {
                ...plan,
                likes: plan.likes.filter(
                  (like) => like.userId !== currentUser?.id
                ),
              };
            } else {
              return {
                ...plan,
                likes: [
                  ...plan.likes,
                  { userId: currentUser?.id, createdAt: new Date() },
                ],
              };
            }
          }
          return plan;
        })
      );

      // Show feedback toast
      toast.success(isLiked ? "Plan unliked" : "Plan liked");
    } catch (error) {
      console.error("Error toggling plan like:", error);
      toast.error("Failed to process like");

      // Refresh plans data to ensure UI is in sync with server
      const plansData = await getLearningPlansByUserId(
        userId,
        currentUser?.token
      );
      setLearningPlans(plansData.data || []);
    }
  };

  const handleDeletePlan = async (planId) => {
    openModal({
      title: "Delete Learning Plan",
      message:
        "Are you sure you want to delete this learning plan? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteLearningPlan(planId, currentUser?.token);
          setLearningPlans(learningPlans.filter((plan) => plan.id !== planId));
          // Update total post count after successful deletion
          setTotalPostCount((prevCount) => Math.max(0, prevCount - 1));
          toast.success("Learning plan deleted successfully");
        } catch (error) {
          console.error("Error deleting learning plan:", error);
          toast.error("Failed to delete learning plan");
        }
      },
    });
  };

  const handleShowFollowers = () => {
    setShowFollowers(true);
  };

  const handleShowFollowing = () => {
    setShowFollowing(true);
  };

  if (!profileUser && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full bg-white bg-opacity-70 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden border border-white border-opacity-30 p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The user profile you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const actionButtons = (
    <>
      {isOwner ? (
        <motion.button
          onClick={() => setShowEditProfile(true)}
          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Edit Profile"
        >
          <Edit size={18} />
        </motion.button>
      ) : (
        <motion.button
          onClick={handleFollowToggle}
          className={`p-2 rounded-full cursor-pointer ml-4 ${
            isFollowing
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          } transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={isFollowing ? "Unfollow" : "Follow"}
        >
          {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
        </motion.button>
      )}
    </>
  );

  return (
    <ProfileLayout
      profileUser={profileUser}
      isLoading={isLoading}
      actionButtons={actionButtons}
      totalPostCount={totalPostCount}
      onShowFollowers={handleShowFollowers}
      onShowFollowing={handleShowFollowing}
    >
      {/* Content Tabs */}
      <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          {["posts", "progress", "plans"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-3 text-center ${
                activeTab === tab
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="capitalize">
                {tab === "posts"
                  ? "Skill Sharing"
                  : tab === "progress"
                  ? "Learning Progress"
                  : "Learning Plans"}
              </span>
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-600 w-full"
                  layoutId="activeTab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {contentLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === "posts" &&
              (posts.length > 0 ? (
                posts.map((post) => (
                  <SkillSharingCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLikePost}
                    onDelete={handleDeletePost}
                    onComment={handleAddPostComment}
                    onCommentUpdated={handleUpdatePostComment}
                    onCommentDeleted={handleDeletePostComment}
                    token={currentUser?.token}
                  />
                ))
              ) : (
                <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 p-8 text-center">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwner
                      ? "Share your skills with the community!"
                      : `${profileUser.name} hasn't shared any posts yet.`}
                  </p>
                </div>
              ))}

            {activeTab === "progress" &&
              (progressEntries.length > 0 ? (
                progressEntries.map((progress) => (
                  <LearningProgressCard
                    key={progress.id}
                    progress={progress}
                    currentUser={currentUser}
                    onLike={handleLikeProgress}
                    onDelete={handleDeleteProgress}
                    onEdit={handleEditProgress}
                    onComment={handleAddProgressComment}
                    onUpdateComment={handleUpdateProgressComment}
                    onDeleteComment={handleDeleteProgressComment}
                    token={currentUser?.token}
                  />
                ))
              ) : (
                <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 p-8 text-center">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No progress updates yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwner
                      ? "Start sharing your learning journey!"
                      : `${profileUser.name} hasn't shared any progress updates yet.`}
                  </p>
                </div>
              ))}

            {activeTab === "plans" &&
              (learningPlans.length > 0 ? (
                learningPlans.map((plan) => (
                  <LearningPlanCard
                    key={plan.id}
                    plan={plan}
                    currentUser={currentUser}
                    onLike={handleLikePlan}
                    onDelete={handleDeletePlan}
                    onEdit={handleEditPlan}
                    onComment={handleAddPlanComment}
                    onUpdateComment={handleUpdatePlanComment}
                    onDeleteComment={handleDeletePlanComment}
                    token={currentUser?.token}
                  />
                ))
              ) : (
                <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 p-8 text-center">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No learning plans yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwner
                      ? "Create and share learning plans with the community!"
                      : `${profileUser.name} hasn't shared any learning plans yet.`}
                  </p>
                </div>
              ))}
          </>
        )}
      </div>

      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditProfile(false)}
          onProfileUpdated={handleProfileUpdated}
          token={currentUser?.token}
        />
      )}

      {showFollowers && (
        <FollowersModal
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
          title="Followers"
          users={profileUser.followedUsers || []}
          currentUser={currentUser}
          token={currentUser?.token}
        />
      )}

      {showFollowing && (
        <FollowersModal
          isOpen={showFollowing}
          onClose={() => setShowFollowing(false)}
          title="Following"
          users={profileUser.followingUsers || []}
          currentUser={currentUser}
          token={currentUser?.token}
        />
      )}

      {/* Edit Progress Modal */}
      {editingProgress && (
        <EditLearningProgressModal
          progressEntry={editingProgress}
          onClose={() => setEditingProgress(null)}
          onProgressUpdated={handleProgressUpdated}
          token={currentUser?.token}
        />
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <EditLearningPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onPlanUpdated={handlePlanUpdated}
          token={currentUser?.token}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        confirmButtonClass={modalState.confirmButtonClass}
        type={modalState.type}
      />
    </ProfileLayout>
  );
};

export default ProfilePage;
