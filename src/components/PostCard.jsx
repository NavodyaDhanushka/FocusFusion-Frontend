import { useState } from "react";

const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onDeleteComment,
  onUpdateComment,
}) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onComment(post.id, commentText);
    setCommentText("");
  };

  const isLikedByUser = post.likes?.some(
    (like) => like.userId === currentUser?.id
  );

  return (
    <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center space-x-3 border-b border-gray-100 border-opacity-50">
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
          <h3 className="font-medium text-gray-800">{post.userName}</h3>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 mb-4">{post.description}</p>

        {/* Media Content */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div
            className={`grid gap-2 mb-4 ${
              post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {post.mediaUrls.map((url, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden bg-black bg-opacity-10"
              >
                {url.includes("video") ? (
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
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-2 pb-2 border-b border-gray-100 border-opacity-30">
          <button
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
              isLikedByUser
                ? "text-red-500 bg-red-50 bg-opacity-40"
                : "text-gray-600 hover:bg-gray-100 hover:bg-opacity-30"
            }`}
            onClick={() => onLike(post.id)}
          >
            <span className="text-lg">{isLikedByUser ? "❤️" : "🤍"}</span>
            <span>{post.likes?.length || 0}</span>
          </button>

          <button
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:bg-opacity-30 transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="text-lg">💬</span>
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-white bg-opacity-20">
          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-4 flex">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-grow px-4 py-2 rounded-l-lg border-0 bg-white bg-opacity-60 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex space-x-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-30"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-xs font-medium">
                      {comment.userName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-800">
                        {comment.userName}
                      </p>
                      {(comment.userId === currentUser?.id ||
                        post.userId === currentUser?.id) && (
                        <div className="flex space-x-2">
                          {comment.userId === currentUser?.id && (
                            <button
                              onClick={() =>
                                onUpdateComment(
                                  post.id,
                                  comment.id,
                                  prompt("Update your comment", comment.content)
                                )
                              }
                              className="text-xs text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteComment(post.id, comment.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-3">No comments yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
