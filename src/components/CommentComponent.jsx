import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { deleteComment, updateComment } from "../api/skillSharingAPI";
import toast from "react-hot-toast";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import {
  deleteLearningProgressComment,
  updateLearningProgressComment,
} from "../api/learningProgressAPI";
import {
  deleteLearningPlanComment,
  updateLearningPlanComment,
} from "../api/learningPlanAPI";
import UserAvatar from "./UserAvatar";

export const CommentForm = ({ postId, onAddComment, currentUser }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      commentText: "",
    },
  });

  const onSubmit = async (data) => {
    if (!data.commentText.trim()) return;

    setIsSubmitting(true);

    try {
      const commentData = {
        userId: currentUser.id,
        userName: currentUser.name,
        content: data.commentText,
      };

      await onAddComment(postId, commentData);
      reset();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex">
      <input
        type="text"
        placeholder="Add a comment..."
        className={`flex-grow px-4 py-2 rounded-l-lg border-0 bg-white bg-opacity-60 focus:ring-2 ${
          errors.commentText ? "focus:ring-red-400" : "focus:ring-blue-400"
        } focus:outline-none`}
        {...register("commentText", { required: true })}
        disabled={isSubmitting}
      />
      <motion.button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300  cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "..." : "Post"}
      </motion.button>
    </form>
  );
};

// comment compoenent
const Comment = ({
  comment,
  postId,
  currentUser,
  postUserId,
  onCommentUpdated,
  onCommentDeleted,
  token,
  commentType,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { modalState, openModal, closeModal } = useConfirmModal();

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      updatedContent: comment.content,
    },
  });

  React.useEffect(() => {
    setValue("updatedContent", comment.content);
  }, [comment.content, setValue]);

  const handleDelete = async () => {
    openModal({
      title: "Delete Comment",
      message:
        "Are you sure you want to delete this comment? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          setIsDeleting(true);

          if (commentType === "SKILL_SHARING") {
            await deleteComment(postId, comment.id, currentUser.id, token);
          } else if (commentType === "LEARNING_PROGRESS") {
            await deleteLearningProgressComment(
              postId,
              comment.id,
              currentUser.id,
              token
            );
          } else if (commentType === "LEARNING_PLANS") {
            await deleteLearningPlanComment(
              postId,
              comment.id,
              currentUser.id,
              token
            );
          } else {
            toast.error("Invalid comment type");
            return;
          }

          onCommentDeleted(postId, comment.id);
          toast.success("Comment deleted");
        } catch (error) {
          console.error("Error deleting comment:", error);
          toast.error("Failed to delete comment");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleUpdate = async (data) => {
    if (!data.updatedContent.trim()) return;

    try {
      const updatedComment = {
        ...comment,
        content: data.updatedContent,
        updatedAt: new Date(),
      };

      if (commentType === "SKILL_SHARING") {
        await updateComment(postId, comment.id, updatedComment, token);
      } else if (commentType === "LEARNING_PROGRESS") {
        await updateLearningProgressComment(
          postId,
          comment.id,
          updatedComment,
          token
        );
      } else if (commentType === "LEARNING_PLANS") {
        await updateLearningPlanComment(
          postId,
          comment.id,
          updatedComment,
          token
        );
      } else {
        toast.error("Invalid comment type");
        return;
      }

      onCommentUpdated(postId, comment.id, data.updatedContent);
      setIsEditing(false);
      toast.success("Comment updated");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  return (
    <>
      <motion.div
        className="flex space-x-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
          <UserAvatar
            src={comment.userProfileImage}
            alt={comment.userName}
            name={comment.userName}
            size="h-8 w-8"
            className="from-blue-300 to-indigo-400 flex-shrink-0"
          />
        </div>

        <div className="flex-grow">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-800">
              {comment.userName}
            </p>
            {(comment.userId === currentUser?.id ||
              postUserId === currentUser?.id) && (
              <div className="flex space-x-2">
                {comment.userId === currentUser?.id && (
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isEditing || isDeleting}
                  >
                    <Edit size={14} />
                  </motion.button>
                )}
                <motion.button
                  onClick={handleDelete}
                  className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isEditing || isDeleting}
                >
                  <Trash size={14} />
                </motion.button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(handleUpdate)} className="mt-1">
              <div className="flex">
                <input
                  type="text"
                  className="flex-grow text-sm px-2 py-1 rounded-l-md border-0 bg-white bg-opacity-70 focus:ring-1 focus:ring-blue-400"
                  {...register("updatedContent", { required: true })}
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-blue-500 text-white text-sm rounded-r-md cursor-pointer"
                >
                  Save
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-500 mt-1"
              >
                Cancel
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-700">{comment.content}</p>
          )}

          <p className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
            {comment.updatedAt &&
              comment.updatedAt !== comment.createdAt &&
              " (edited)"}
          </p>
        </div>
      </motion.div>

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
    </>
  );
};

export default Comment;
