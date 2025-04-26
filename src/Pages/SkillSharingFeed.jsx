import { useState, useEffect } from "react";
import { Heart, MessageSquare, Edit, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import {
  getAllPosts,
  addLike,
  removeLike,
  addComment,
  deletePost,
} from "../api/skillSharingAPI";
import useConfirmModal from "../hooks/useConfirmModal";
import CreatePostForm from "../components/CreateSkillPostModal";
import Comment, { CommentForm } from "../components/CommentComponent";
import EditPostModal from "../components/EditSkillPostModal";
import ConfirmModal from "../components/ConfirmModal";
// import EditPostModal from "./EditPostModal";
// import ConfirmModal from "./ConfirmModal";

import { Link } from "react-router-dom";

const SkillSharingFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const { modalState, openModal, closeModal } = useConfirmModal();

  const { currentUser } = useAuth();

  useEffect(() => {
    // fetch all posts when component mounts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getAllPosts(currentUser?.token);
      setPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostUpdated = () => {
    fetchPosts();
    setEditingPost(null);
  };

  const handleDeletePost = async (postId) => {
    const post = posts.find((p) => p.id === postId);

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
          toast.success("Post deleted successfully");
        } catch (error) {
          console.error("Error deleting post:", error);
          toast.error("Failed to delete post");
        }
      },
    });
  };

  const handleLike = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    const isLiked = post?.likes?.some(
      (like) => like.userId === currentUser?.id
    );

    const originalPosts = [...posts];

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          if (isLiked) {
            return {
              ...post,
              likes: post.likes.filter(
                (like) => like.userId !== currentUser.id
              ),
            };
          } else {
            return {
              ...post,
              likes: [
                ...(post.likes || []),
                { userId: currentUser.id, createdAt: new Date() },
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
        await removeLike(postId, currentUser.id, currentUser.token);
      } else {
        const likeData = { userId: currentUser.id };
        await addLike(postId, likeData, currentUser.token);
      }
      // If successful, we keep the UI as is (already updated)
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to process like");

      // Revert to original state if API call fails
      setPosts(originalPosts);
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId],
    });
  };

  const handleAddComment = async (postId, commentData) => {
    try {
      const response = await addComment(postId, commentData, currentUser.token);

      // Update the posts state with the updated post from the response
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

  const handleCommentUpdated = (postId, commentId, newContent) => {
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

  const handleCommentDeleted = (postId, commentId) => {
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

  return (
    <div className="space-y-6">
      {/* Create Post Form */}
      <CreatePostForm onPostCreated={handlePostCreated} />

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center items-center my-12">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your skills and learning progress!
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Post Header with User Info and Action Buttons */}
              <div className="p-4 flex items-center justify-between border-b border-gray-100 border-opacity-50">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white overflow-hidden">
                    {post.userProfileImage ? (
                      <img
                        src={post.userProfileImage}
                        alt={post.userName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {post.userName?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link to={`/profile/${post.userId}`} target="_blank">
                      <h3 className="font-medium text-gray-800 hover:underline">
                        {post.userName}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Post Owner Actions */}
                {post.userId === currentUser?.id && (
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => setEditingPost(post)}
                      className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash size={18} />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-800 mb-4">{post.description}</p>
                {/*media Content */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div
                    className={`grid gap-2 mb-4 ${
                      post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {post.mediaUrls.map((urlString, index) => {
                      //try to parse the media object from JSON
                      let mediaObject;
                      let isVideo = false;
                      let url = urlString;

                      //try to parse as JSON first
                      try {
                        mediaObject = JSON.parse(urlString);
                        url = mediaObject.dataUrl;
                        isVideo = mediaObject.type === "video";
                      } catch (error) {
                        isVideo =
                          urlString.includes("video") ||
                          urlString.includes("data:video/");
                      }

                      return (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden bg-black bg-opacity-10"
                        >
                          {isVideo ? (
                            <video
                              controls
                              src={url}
                              className="w-full h-full object-contain max-h-80"
                            />
                          ) : (
                            <img
                              src={url}
                              alt="Post content"
                              className="w-full h-full object-contain max-h-80"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-2 pb-2 border-b border-gray-100 border-opacity-30">
                  <motion.button
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer  ${
                      post.likes?.some(
                        (like) => like.userId === currentUser?.id
                      )
                        ? "text-red-500"
                        : "text-gray-600 hover:bg-gray-100 hover:bg-opacity-30"
                    }`}
                    onClick={() => handleLike(post.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart
                      size={18}
                      className={
                        post.likes?.some(
                          (like) => like.userId === currentUser?.id
                        )
                          ? "fill-red-500"
                          : ""
                      }
                    />
                    <span>{post.likes?.length || 0}</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:bg-opacity-30 transition-colors cursor-pointer"
                    onClick={() => toggleComments(post.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageSquare size={18} />
                    <span>{post.comments?.length || 0}</span>
                  </motion.button>
                </div>
                {/* Comments Section */}
                <AnimatePresence>
                  {showComments[post.id] && (
                    <motion.div
                      className="mt-3 space-y-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Add Comment Form */}
                      <CommentForm
                        postId={post.id}
                        onAddComment={handleAddComment}
                        currentUser={currentUser}
                      />

                      {/* Comments List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <Comment
                              key={comment.id}
                              comment={comment}
                              postId={post.id}
                              currentUser={currentUser}
                              postUserId={post.userId}
                              onCommentUpdated={handleCommentUpdated}
                              onCommentDeleted={handleCommentDeleted}
                              token={currentUser.token}
                              commentType="SKILL_SHARING"
                            />
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-2">
                            No comments yet
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handlePostUpdated}
          token={currentUser.token}
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

export default SkillSharingFeed;
