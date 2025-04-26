import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { updateLearningPlan } from "../api/learningPlanAPI";
import toast from "react-hot-toast";

const EditLearningPlanModal = ({ plan, onClose, onPlanUpdated, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: plan?.title || "",
      description: plan?.description || "",
      topics: plan?.topics || "",
      resources: plan?.resources || "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!data.title.trim() || !data.description.trim()) {
        toast.error("Title and description are required");
        setIsSubmitting(false);
        return;
      }

      const updatedData = {
        ...data,
      };

      await updateLearningPlan(plan.id, updatedData, token);
      toast.success("Learning plan updated successfully");
      onPlanUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating learning plan:", error);
      toast.error("Failed to update learning plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <motion.div
        className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-md m-4 overflow-hidden border border-white border-opacity-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 border-opacity-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit Learning Plan
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              placeholder="Give your learning plan a clear title"
              className={`w-full p-2 bg-white bg-opacity-70 rounded-lg border ${
                errors.title ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-400 focus:outline-none`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="Describe your learning plan in detail"
              rows="4"
              className={`w-full p-2 bg-white bg-opacity-70 rounded-lg border ${
                errors.description ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              {...register("topics")}
              placeholder="e.g., JavaScript, React, UI Design"
              className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add the topics you'll be covering in this learning plan
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resources (comma-separated)
            </label>
            <textarea
              {...register("resources")}
              placeholder="e.g., https://example.com/tutorial, Book: JavaScript Basics"
              rows="3"
              className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add links to articles, books, courses, or other resources
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 cursor-pointer"
              whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Plan"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditLearningPlanModal;
