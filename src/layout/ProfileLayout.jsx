import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../context/auth";
import UserAvatar from "../components/UserAvatar";

const ProfileLayout = ({
  children,
  actionButtons,
  profileUser,
  isLoading,
  onShowFollowers,
  onShowFollowing,
  totalPostCount = 0,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsAnimated(true);
    }
  }, [isLoading]);

  const goBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* <Header /> */}
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-10">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* <Header /> */}

      {/* Profile Header with Cover and Avatar */}
      <div className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 h-48 relative">
        <div className="max-w-6xl mx-auto px-4 h-full relative">
          <button
            onClick={goBack}
            className="absolute left-4 top-4 z-10 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all text-gray-800 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative">
        {/* Main Content */}
        <motion.div
          className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isAnimated ? 1 : 0, y: isAnimated ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Avatar and Top Info */}
          <div className="flex flex-col md:flex-row md:items-end">
            <div className="flex flex-col items-center md:items-start md:flex-row md:space-x-6">
              {/* Avatar */}
              <div className="border-4 border-white shadow-md -mt-20 mb-4 md:mb-0 relative z-10 rounded-full">
                <UserAvatar
                  src={profileUser?.profileImage}
                  alt={profileUser?.name}
                  name={profileUser?.name}
                  size="h-32 w-32"
                  className="bg-white"
                />
              </div>

              <div className="text-center md:text-left flex-grow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {profileUser?.name}
                    </h1>
                    <p className="text-gray-600">{profileUser?.email}</p>

                    {profileUser?.bio && (
                      <p className="mt-2 text-gray-700 max-w-xl">
                        {profileUser.bio}
                      </p>
                    )}
                  </div>

                  {/* Action buttons passed from ProfilePage */}
                  <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-2">
                    {actionButtons}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row - Changed Links to buttons */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
            <button className="flex flex-col items-center py-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
              <span className="text-lg font-bold text-gray-800">
                {totalPostCount || 0}
              </span>
              <span className="text-sm text-gray-600">Posts</span>
            </button>

            <button
              onClick={onShowFollowers}
              className="flex flex-col items-center py-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <span className="text-lg font-bold text-gray-800">
                {profileUser?.followedUsers?.length || 0}
              </span>
              <span className="text-sm text-gray-600">Followers</span>
            </button>

            <button
              onClick={onShowFollowing}
              className="flex flex-col items-center py-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <span className="text-lg font-bold text-gray-800">
                {profileUser?.followingUsers?.length || 0}
              </span>
              <span className="text-sm text-gray-600">Following</span>
            </button>
          </div>

          {/* Skills Tags */}
          {profileUser?.skills && profileUser.skills.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profileUser.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Child Content */}
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
