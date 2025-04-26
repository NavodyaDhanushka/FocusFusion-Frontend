/**
 * LearningPlanPage Component - Main page for managing and displaying learning plans
 * 
 * Features:
 * - Create new learning plans
 * - View existing plans with like/comment functionality
 * - Edit/delete plans (with confirmation)
 * - Responsive design with animations
 */
const LearningPlanPage = () => {
  // Authentication context - provides current user data
  const { currentUser } = useAuth();
  
  // State management for learning plans data and UI states
  const [learningPlans, setLearningPlans] = useState([]); // Stores all learning plans
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state
  const [editingPlan, setEditingPlan] = useState(null); // Currently edited plan
  
  // Confirmation modal hook - handles delete confirmations
  const { modalState, openModal, closeModal } = useConfirmModal();

  // Form handling configuration using react-hook-form
  const {
    register, // Registers form inputs
    handleSubmit, // Handles form submission
    formState: { errors }, // Tracks form validation errors
    reset, // Resets form fields
  } = useForm({
    defaultValues: { // Initial empty form values
      title: "",
      description: "",
      topics: "",
      resources: "",
    },
  });

  /**
   * Fetches learning plans when component mounts
   * Dependency array is empty to run only once on mount
   */
  useEffect(() => {
    fetchLearningPlans();
  }, []);

  /**
   * Fetches all learning plans from API
   * Handles loading states and error notifications
   */
  const fetchLearningPlans = async () => {
    setLoading(true); // Activate loading indicator
    try {
      const response = await getAllLearningPlans(currentUser?.token);
      setLearningPlans(response.data); // Update plans state
    } catch (error) {
      console.error("Error fetching learning plans:", error);
      toast.error("Failed to load learning plans"); // User notification
    } finally {
      setLoading(false); // Deactivate loading indicator
    }
  };

  /**
   * Handles submission of new learning plan
   * @param {Object} data - Form data containing plan details
   */
  const handlePlanSubmit = async (data) => {
    // Authentication check
    if (!currentUser) {
      toast.error("You must be logged in to share a learning plan");
      return;
    }

    // Required field validation
    if (!data.title.trim() || !data.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsSubmitting(true); // Disable form during submission

    try {
      // Prepare plan data with user information
      const planData = {
        userId: currentUser.id,
        userName: currentUser.name,
        userProfileImage: currentUser.profileImage,
        ...data,
      };

      // API call to create new plan
      const response = await createLearningPlan(
        currentUser.id,
        planData,
        currentUser.token
      );

      // Success handling
      toast.success("Learning plan shared successfully");
      setLearningPlans([response.data, ...learningPlans]); // Prepend new plan
      reset(); // Clear form fields
    } catch (error) {
      console.error("Error creating learning plan:", error);
      toast.error("Failed to share learning plan");
    } finally {
      setIsSubmitting(false); // Re-enable form
    }
  };

  /**
   * Handles toggling like status on a learning plan
   * @param {string} planId - ID of the plan to like/unlike
   */
  const handleLike = async (planId) => {
    if (!currentUser) {
      toast.error("You must be logged in to like this plan");
      return;
    }

    try {
      // Check if current user already liked this plan
      const isLiked = learningPlans
        .find((p) => p.id === planId)
        ?.likes?.some((like) => like.userId === currentUser.id);

      if (isLiked) {
        // Unlike functionality
        await removeLike(planId, currentUser.id, currentUser.token);
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
        // Like functionality
        const likeData = { userId: currentUser.id, userName: currentUser.name };
        const response = await addLike(planId, likeData, currentUser.token);
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

  /**
   * Handles adding a comment to a learning plan
   * @param {string} planId - ID of the plan to comment on
   * @param {Object} commentData - Comment content and metadata
   */
  const handleAddComment = async (planId, commentData) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const response = await addComment(planId, commentData, currentUser.token);
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

  /**
   * Handles updating a comment (optimistic update)
   * @param {string} planId - ID of the plan containing the comment
   * @param {string} commentId - ID of the comment to update
   * @param {string} updatedContent - New comment content
   */
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

  /**
   * Handles deleting a comment (optimistic update)
   * @param {string} planId - ID of the plan containing the comment
   * @param {string} commentId - ID of the comment to delete
   */
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

  /**
   * Opens edit modal for a specific plan
   * @param {Object} plan - The plan to edit
   */
  const handleEdit = (plan) => {
    setEditingPlan(plan);
  };

  /**
   * Callback after successful plan update
   * Refreshes the plans list and closes edit modal
   */
  const handlePlanUpdated = async () => {
    await fetchLearningPlans();
    setEditingPlan(null);
  };

  /**
   * Initiates plan deletion with confirmation
   * @param {string} planId - ID of the plan to delete
   */
  const handleDelete = (planId) => {
    openModal({
      title: "Delete Learning Plan",
      message: "Are you sure you want to delete this learning plan? This action cannot be undone.",
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

  // Component rendering
  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      {/* Learning Plan Creation Form */}
      <motion.div
        className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 mb-6 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Form content remains exactly as is */}
      </motion.div>

      {/* Learning Plans Feed */}
      {loading ? (
        // Loading state
      ) : learningPlans.length === 0 ? (
        // Empty state
      ) : (
        // Plans list
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