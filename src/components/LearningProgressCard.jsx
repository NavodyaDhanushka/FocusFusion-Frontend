import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash } from "lucide-react";
import Comment, { CommentForm } from "./CommentComponent";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import UserAvatar from "./UserAvatar";

// status options for display
const STATUS_OPTIONS = {
  not_started: { name: "Not Started", color: "bg-gray-100 text-gray-800" },
  in_progress: { name: "In Progress", color: "bg-blue-100 text-blue-800" },
  completed: { name: "Completed", color: "bg-green-100 text-green-800" },
};

// template types for display
const TEMPLATE_TYPES = {
  general: { icon: "📝", name: "General Progress" },
  tutorial: { icon: "🎓", name: "Tutorial Completion" },
  project: { icon: "🏆", name: "Project Milestone" },
};

const LearningProgressCard = ({
  progress,
  currentUser,
  onLike,
  onComment,
  onDeleteComment,
  onUpdateComment,
  onEdit,
  onDelete,
  token,
}) => {
  const [showComments, setShowComments] = useState(false);
  const { modalState, openModal, closeModal } = useConfirmModal();

  const isLikedByUser = progress.likes?.some(
    (like) => like.userId === currentUser?.id
  );

  const isOwner = progress.userId === currentUser?.id;

  const handleDeleteClick = () => {
    onDelete(progress.id);
  };

  const handleAddComment = async (progressId, commentData) => {
    try {
      await onComment(progressId, commentData);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  //get the template and status info
  const templateInfo = TEMPLATE_TYPES[progress.templateType] || {
    icon: "📝",
    name: "Progress",
  };
  const statusInfo = STATUS_OPTIONS[progress.status] || {
    name: "Status",
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 mb-6 overflow-hidden">
      {/* progress Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 border-opacity-50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white overflow-hidden">
            <UserAvatar
              src={progress.userProfileImage}
              alt={progress.userName}
              name={progress.userName}
              size="h-10 w-10"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{progress.userName}</h3>
            <p className="text-xs text-gray-500">
              {new Date(progress.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {templateInfo.icon} {templateInfo.name}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.name}
          </span>

          {isOwner && (
            <div className="flex space-x-1 ml-2">
              <motion.button
                onClick={() => onEdit(progress)}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-50 text-blue-600  cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit size={16} />
              </motion.button>
              <motion.button
                onClick={handleDeleteClick}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-50 text-red-500  cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* progress Content */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          {progress.title}
        </h3>

        {progress.description && (
          <p className="text-gray-700 mb-3">{progress.description}</p>
        )}

        <div className="bg-white bg-opacity-40 rounded-lg p-3 mb-3 space-y-2">
          {progress.tutorialName && (
            <div className="flex">
              <span className="text-gray-600 font-medium w-28">Tutorial:</span>
              <span className="text-gray-800">{progress.tutorialName}</span>
            </div>
          )}

          {progress.projectName && (
            <div className="flex">
              <span className="text-gray-600 font-medium w-28">Project:</span>
              <span className="text-gray-800">{progress.projectName}</span>
            </div>
          )}

          {progress.skillsLearned && (
            <div className="flex">
              <span className="text-gray-600 font-medium w-28">Skills:</span>
              <div className="flex flex-wrap gap-1">
                {progress.skillsLearned.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {progress.challenges && (
            <div className="flex">
              <span className="text-gray-600 font-medium w-28">
                Challenges:
              </span>
              <span className="text-gray-800">{progress.challenges}</span>
            </div>
          )}

          {progress.nextSteps && (
            <div className="flex">
              <span className="text-gray-600 font-medium w-28">
                Next Steps:
              </span>
              <span className="text-gray-800">{progress.nextSteps}</span>
            </div>
          )}
        </div>

        {/* action Buttons */}
        <div className="flex justify-between items-center mt-2 pb-2 border-b border-gray-100 border-opacity-30">
          <button
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors  cursor-pointer ${
              isLikedByUser
                ? "text-red-500 bg-red-50 bg-opacity-40"
                : "text-gray-600 hover:bg-gray-100 hover:bg-opacity-30"
            }`}
            onClick={() => onLike(progress.id)}
          >
            <span className="text-lg">{isLikedByUser ? "❤️" : "🤍"}</span>
            <span>{progress.likes?.length || 0}</span>
          </button>

          <button
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:bg-opacity-30 transition-colors cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="text-lg">💬</span>
            <span>{progress.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* comments Section */}
      {showComments && (
        <div className="p-4 bg-white bg-opacity-20">
          {/*add Comment Form */}
          <CommentForm
            postId={progress.id}
            onAddComment={handleAddComment}
            currentUser={currentUser}
          />

          {/* comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto mt-4">
            {progress.comments && progress.comments.length > 0 ? (
              progress.comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  postId={progress.id}
                  currentUser={currentUser}
                  postUserId={progress.userId}
                  onCommentUpdated={onUpdateComment}
                  onCommentDeleted={onDeleteComment}
                  token={token}
                  commentType="LEARNING_PROGRESS"
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-3">No comments yet</p>
            )}
          </div>
        </div>
      )}

      {/* confirmation Modal */}
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

export default LearningProgressCard;
