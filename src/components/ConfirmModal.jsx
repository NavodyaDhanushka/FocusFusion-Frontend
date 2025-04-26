import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-500 hover:bg-red-600",
  type = "danger", // 'danger', 'warning', or 'info'
}) => {
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  let icon = null;
  let iconBgColor = "";

  if (type === "danger") {
    icon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path
          fillRule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
          clipRule="evenodd"
        />
      </svg>
    );
    iconBgColor = "bg-red-100 text-red-600";
  } else if (type === "warning") {
    icon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
    );
    iconBgColor = "bg-amber-100 text-amber-600";
  } else {
    icon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
    );
    iconBgColor = "bg-blue-100 text-blue-600";
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black[100] bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
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
            {/* header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 border-opacity-50">
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* content */}
            <div className="p-5">
              <div className="flex items-start">
                <div
                  className={`p-2 rounded-full ${iconBgColor} mr-3 flex-shrink-0`}
                >
                  {icon}
                </div>
                <p className="text-gray-700">{message}</p>
              </div>
            </div>

            {/* actions */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 border-opacity-50 bg-gray-50 bg-opacity-50">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors cursor-pointer ${confirmButtonClass}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
