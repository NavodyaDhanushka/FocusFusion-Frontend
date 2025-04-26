import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, UserMinus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getUsersById, followUser, unfollowUser } from "../api/profileAPI";
import UserAvatar from "./UserAvatar";

const FollowersModal = ({
  isOpen,
  onClose,
  title,
  users = [],
  currentUser,
  token,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [followStates, setFollowStates] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      if (!users.length) {
        setLoading(false);
        setUsersList([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedUsers = await getUsersById(users, token);
        setUsersList(fetchedUsers || []);

        // Initialize follow states
        const initialFollowStates = {};
        fetchedUsers.forEach((user) => {
          initialFollowStates[user.id] =
            currentUser?.followingUsers?.includes(user.id) || false;
        });
        setFollowStates(initialFollowStates);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [users, isOpen, token, currentUser]);

  const handleFollowToggle = async (userId) => {
    if (!currentUser) {
      toast.error("You must be logged in to follow users");
      navigate("/login");
      return;
    }

    try {
      if (followStates[userId]) {
        await unfollowUser(userId, token);
        toast.success("Unfollowed user");
      } else {
        await followUser(userId, token);
        toast.success("Now following user");
      }

      // Toggle follow state
      setFollowStates({
        ...followStates,
        [userId]: !followStates[userId],
      });
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error("Failed to update follow status");
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const filteredUsers = usersList.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-md m-4 overflow-hidden border border-white border-opacity-20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={handleModalClick}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 border-opacity-50">
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200 border-opacity-30">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* User List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  {searchQuery
                    ? "No users match your search."
                    : users.length > 0
                    ? "No user information available."
                    : `No ${title.toLowerCase()} yet.`}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    className="p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center space-x-3 cursor-pointer flex-grow"
                        onClick={() => handleViewProfile(user.id)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white overflow-hidden">
                          <UserAvatar
                            src={user.profileImage}
                            alt={user.name}
                            name={user.name}
                            size="h-10 w-10"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-800">
                            {user.name}
                          </h4>
                          {user.skills && user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.skills.slice(0, 2).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {user.skills.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{user.skills.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {currentUser && currentUser.id !== user.id && (
                        <motion.button
                          onClick={() => handleFollowToggle(user.id)}
                          className={`p-2 rounded-full ${
                            followStates[user.id]
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          } transition-colors`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {followStates[user.id] ? (
                            <UserMinus size={18} />
                          ) : (
                            <UserPlus size={18} />
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowersModal;
