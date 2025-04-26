import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth/useAuth";
import toast from "react-hot-toast";
import UserAvatar from "./UserAvatar";

const Header = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("feed"); // Default to feed tab
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const notificationRef = useRef(null);
  const profileDropdownRef = useRef(null);

  //get the auth status
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    //set current active tab based on current route
    const path = window.location.pathname;
    if (path.includes("progress")) {
      setActiveTab("progress");
    } else if (path.includes("plans")) {
      setActiveTab("plans");
    } else {
      setActiveTab("feed");
    }

    // This would be replaced with an actual API call
    // Simulating unread notifications
    setUnreadCount(3);
    setNotifications([
      {
        id: 1,
        message: "John Doe liked your post",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        message: "Jane Smith commented on your learning plan",
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        message: "Your progress update received 5 likes",
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);

    //click outside to close dropdown handlers
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    //animation state
    setIsLoaded(true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      //logout the user
      logout();
    } catch (error) {
      toast.error("Logout failed:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const navigateToProfile = () => {
    setShowProfileDropdown(false);
    navigate(`/profile/${currentUser?.id}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    //navigate to the corresponding route
    navigate(tab === "feed" ? "/" : `/${tab}`);
  };

  //tabs arrayyy
  const tabItems = [
    { id: "feed", name: "Skill Sharing", icon: "📷" },
    { id: "progress", name: "Learning Progress", icon: "📈" },
    { id: "plans", name: "Learning Plans", icon: "📋" },
    { id: "events", name: "Events", icon: "📆" },
    { id: "resources", name: "Resources", icon: "📂" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white bg-opacity-30 backdrop-blur-lg shadow-md border-b border-white border-opacity-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* logo and mboile menu */}
          <div className="flex items-center">
            <button
              className="mr-2 sm:hidden text-blue-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 cursor-pointer"
              onClick={() => navigate("/")}
            >
              FocusFusion
            </motion.h1>
          </div>

          {/* navigation tabs */}
          <motion.div
            className="hidden sm:flex items-center justify-center space-x-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {tabItems.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2  cursor-pointer
                ${
                  activeTab === tab.id
                    ? "bg-white bg-opacity-70 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-white hover:bg-opacity-40"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.3 + index * 0.1,
                }}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-blue-600 w-full"
                    layoutId="activeTab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* user profile and notification icon */}
          <div className="flex items-center space-x-3">
            <div className="relative" ref={notificationRef}>
              <motion.button
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-colors relative"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Bell className="h-6 w-6 text-gray-700" />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      delay: 1,
                    }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    className="absolute right-0 mt-2 w-80 bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden z-50 border border-white border-opacity-40"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          className="text-sm text-blue-600 hover:text-blue-700"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <p className="text-sm text-gray-800">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileDropdownRef}>
              <motion.button
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-white hover:bg-opacity-30 transition-colors"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white overflow-hidden">
                  <UserAvatar
                    src={currentUser?.profileImage}
                    alt={currentUser?.name}
                    name={currentUser?.name}
                    size="h-8 w-8"
                  />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </motion.button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden z-50 border border-white border-opacity-40"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-medium text-gray-800 truncate">
                        {currentUser?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {currentUser?.email || ""}
                      </p>
                    </div>
                    <div>
                      <motion.button
                        className="flex items-center space-x-2 w-full p-3 text-left hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={navigateToProfile}
                        whileHover={{ x: 5 }}
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <span>Profile</span>
                      </motion.button>
                      <motion.button
                        className="flex items-center space-x-2 w-full p-3 text-left hover:bg-red-50 transition-colors text-red-600 cursor-pointer"
                        onClick={handleLogout}
                        whileHover={{ x: 5 }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* mobile navigation menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="sm:hidden py-2 border-t border-gray-100 border-opacity-50"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-1">
                {tabItems.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      handleTabChange(tab.id);
                      setMenuOpen(false);
                    }}
                    className={`py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 
                    ${
                      activeTab === tab.id
                        ? "bg-white bg-opacity-70 text-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-white hover:bg-opacity-40"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
