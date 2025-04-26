import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import LearningPlanCard from "../components/LearningPlanCard";
import EditLearningPlanModal from "../components/EditLearningPlanModal";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "../components/ConfirmModal";
import {
  createLearningPlan,
  getAllLearningPlans,
  deleteLearningPlan,
  addLike,
  removeLike,
  addComment,
  updateLearningPlanComment,
  deleteLearningPlanComment,
} from "../api/learningPlanAPI";

const LearningPlanPage = () => {
  const { currentUser } = useAuth();
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const { modalState, openModal, closeModal } = useConfirmModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      topics: "",
      resources: "",
    },
  });

  useEffect(() => {
    fetchLearningPlans();
  }, []);

  const fetchLearningPlans = async () => {
    setLoading(true);
    try {
      const response = await getAllLearningPlans(currentUser?.token);
      setLearningPlans(response.data);
    } catch (error) {
      console.error("Error fetching learning plans:", error);
      toast.error("Failed to load learning plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (data) => {
    if (!currentUser) {
      toast.error("You must be logged in to share a learning plan");
      return;
    }

    if (!data.title.trim() || !data.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const planData = {
        userId: currentUser.id,
        userName: currentUser.name,
        userProfileImage: currentUser.profileImage,
        ...data,
      };

      const response = await createLearningPlan(
        currentUser.id,
        planData,
        currentUser.token
      );

      toast.success("Learning plan shared successfully");
      setLearningPlans([response.data, ...learningPlans]);
      reset();
    } catch (error) {
      console.error("Error creating learning plan:", error);
      toast.error("Failed to share learning plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (planId) => {
    if (!currentUser) {
      toast.error("You must be logged in to like this plan");
      return;
    }

    try {
      const isLiked = learningPlans
        .find((p) => p.id === planId)
        ?.likes?.some((like) => like.userId === currentUser.id);

      if (isLiked) {
        // Unlike
        await removeLike(planId, currentUser.id, currentUser.token);

        // Update state
        setLearningPlans(
          learningPlans.map((plan) => {
            if (plan.id === planId) {
              return {
                ...plan,
                likes: plan.likes.filter(
                  (like) => like.userId !== currentUser.id
                ),
              };
            }
            return plan;
          })
        );
      } else {
        // Like
        const likeData = { userId: currentUser.id, userName: currentUser.name };
        const response = await addLike(planId, likeData, currentUser.token);

        // Update state
        setLearningPlans(
          learningPlans.map((plan) => {
            if (plan.id === planId) {
              return response.data;
            }
            return plan;
          })
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to process like");
    }
  };

  const handleAddComment = async (planId, commentData) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const response = await addComment(planId, commentData, currentUser.token);

      // Update state
      setLearningPlans(
        learningPlans.map((plan) => {
          if (plan.id === planId) {
            return response.data;
          }
          return plan;
        })
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      throw error;
    }
  };

  const handleUpdateComment = async (planId, commentId, updatedContent) => {
    setLearningPlans(
      learningPlans.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            comments: plan.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  content: updatedContent,
                  updatedAt: new Date(),
                };
              }
              return comment;
            }),
          };
        }
        return plan;
      })
    );
  };

  const handleDeleteComment = async (planId, commentId) => {
    setLearningPlans(
      learningPlans.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            comments: plan.comments.filter(
              (comment) => comment.id !== commentId
            ),
          };
        }
        return plan;
      })
    );
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
  };

  const handlePlanUpdated = async () => {
    await fetchLearningPlans();
    setEditingPlan(null);
  };

  const handleDelete = (planId) => {
    openModal({
      title: "Delete Learning Plan",
      message:
        "Are you sure you want to delete this learning plan? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteLearningPlan(planId, currentUser.token);
          setLearningPlans(learningPlans.filter((plan) => plan.id !== planId));
          toast.success("Learning plan deleted");
        } catch (error) {
          console.error("Error deleting learning plan:", error);
          toast.error("Failed to delete learning plan");
        }
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      {/* Create Learning Plan Form */}
      <motion.div
        className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 mb-6 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-gray-200 border-opacity-30">
          <h2 className="text-xl font-semibold text-gray-800">
            Share Your Learning Plan
          </h2>
        </div>

        <form
          onSubmit={handleSubmit(handlePlanSubmit)}
          className="p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              placeholder="Give your learning plan a clear title"
              className={`w-full p-2 bg-white bg-opacity-70 rounded-lg border ${
                errors.title ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-400 focus:outline-none`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="Describe your learning plan in detail"
              rows="4"
              className={`w-full p-2 bg-white bg-opacity-70 rounded-lg border ${
                errors.description ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              {...register("topics")}
              placeholder="e.g., JavaScript, React, UI Design"
              className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Add the topics you'll be covering in this learning plan
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resources (comma-separated)
            </label>
            <textarea
              {...register("resources")}
              placeholder="e.g., https://example.com/tutorial, Book: JavaScript Basics"
              rows="3"
              className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Add links to articles, books, courses, or other resources
            </p>
          </div>

          <div className="flex justify-end">
            <motion.button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 cursor-pointer"
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sharing..." : "Share Learning Plan"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Learning Plans Feed */}
      {loading ? (
        <div className="flex justify-center items-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : learningPlans.length === 0 ? (
        <motion.div
          className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No learning plans yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your learning journey with the community!
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {learningPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <LearningPlanCard
                plan={plan}
                currentUser={currentUser}
                onLike={handleLike}
                onComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onUpdateComment={handleUpdateComment}
                onEdit={handleEdit}
                onDelete={handleDelete}
                token={currentUser?.token}
              />
            </motion.div>
          ))}
        </motion.div>
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
    </div>
  );
};

export default LearningPlanPage;
