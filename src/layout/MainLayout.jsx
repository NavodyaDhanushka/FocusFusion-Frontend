import React, { useState, useEffect } from "react";
import { Users, Compass, Bookmark, Hash, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import { useAuth } from "../context/auth/useAuth";

const suggestedUsers = [
  {
    id: 1,
    name: "Emma Wilson",
    bio: "UI/UX Designer",
    skills: ["Design", "Figma"],
  },
  {
    id: 2,
    name: "Michael Chen",
    bio: "Full Stack Developer",
    skills: ["React", "Node.js"],
  },
  {
    id: 3,
    name: "Sarah Johnson",
    bio: "Data Scientist",
    skills: ["Python", "ML"],
  },
];

const trendingTopics = [
  { id: 1, name: "React Hooks", count: 342 },
  { id: 2, name: "CSS Grid", count: 275 },
  { id: 3, name: "UX Design", count: 189 },
  { id: 4, name: "Python", count: 156 },
];

const MainLayout = ({ children, activeTab }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setIsLoaded(false);
    } else {
      setIsLoaded(true);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* header */}
      <Header activeTab={activeTab} />

      {/* main content with side columns */}
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* left side bar */}
          <motion.div
            className="hidden lg:block lg:col-span-3 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* user panel */}
            <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 overflow-hidden">
              <div className="p-4 border-b border-gray-100 border-opacity-40">
                <h3 className="font-semibold text-gray-800">Navigation</h3>
              </div>
              <div className="p-2">
                <div className="space-y-1">
                  {[
                    { icon: <User size={18} />, label: "My Profile" },
                    { icon: <Bookmark size={18} />, label: "Saved Items" },
                    { icon: <Compass size={18} />, label: "Explore" },
                    { icon: <Users size={18} />, label: "My Network" },
                  ].map((item, index) => (
                    <motion.button
                      key={index}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-white hover:bg-opacity-50 transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: isLoaded ? 1 : 0,
                        x: isLoaded ? 0 : -20,
                      }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-blue-500">{item.icon}</span>
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* trending topics */}
            <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 overflow-hidden">
              <div className="p-4 border-b border-gray-100 border-opacity-40">
                <h3 className="font-semibold text-gray-800">Trending Topics</h3>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: isLoaded ? 1 : 0,
                        x: isLoaded ? 0 : -20,
                      }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Hash size={16} className="text-blue-500" />
                        <span className="text-gray-800">{topic.name}</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {topic.count}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* main content */}
          <motion.div
            className="col-span-1 lg:col-span-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* here will render the specific tab content */}
            {children}
          </motion.div>

          {/* right side bar */}
          <motion.div
            className="hidden lg:block lg:col-span-3 space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* People You May Know */}
            <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 overflow-hidden">
              <div className="p-4 border-b border-gray-100 border-opacity-40">
                <h3 className="font-semibold text-gray-800">
                  People You May Know
                </h3>
              </div>
              <div className="p-2">
                {suggestedUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    className="p-3 hover:bg-white hover:bg-opacity-40 rounded-lg transition-all duration-200"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{
                      opacity: isLoaded ? 1 : 0,
                      x: isLoaded ? 0 : 20,
                    }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white overflow-hidden">
                        <span className="text-lg font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">
                          {user.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {user.bio}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button className="flex-1 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Connect
                      </button>
                      <button className="px-3 py-1.5 bg-white bg-opacity-70 text-gray-700 text-sm rounded-lg hover:bg-opacity-100 transition-colors">
                        Ignore
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* learning stat */}
            <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 overflow-hidden">
              <div className="p-4 border-b border-gray-100 border-opacity-40">
                <h3 className="font-semibold text-gray-800">
                  Your Learning Stats
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1, delay: 1 }}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Weekly Progress
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        75%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 1, delay: 1 }}
                      ></motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Completed Courses
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        12
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "60%" }}
                        transition={{ duration: 1, delay: 1.3 }}
                      ></motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Active Streaks
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        5 days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "50%" }}
                        transition={{ duration: 1, delay: 1.5 }}
                      ></motion.div>
                    </div>
                  </motion.div>
                </div>

                <motion.button
                  className="w-full mt-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.7 }}
                >
                  View Detailed Stats
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
