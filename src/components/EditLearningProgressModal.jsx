import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { updateLearningProgress } from "../api/learningProgressAPI";
import toast from "react-hot-toast";

// Status options
const STATUS_OPTIONS = [
  {
    id: "not_started",
    name: "Not Started",
    color: "bg-gray-100 text-gray-800",
  },
  {
    id: "in_progress",
    name: "In Progress",
    color: "bg-blue-100 text-blue-800",
  },
  { id: "completed", name: "Completed", color: "bg-green-100 text-green-800" },
];

// Templates
const TEMPLATES = [
  {
    id: "general",
    name: "General Progress",
    icon: "📝",
    fields: ["title", "description", "skillsLearned"],
  },
  {
    id: "tutorial",
    name: "Tutorial Completion",
    icon: "🎓",
    fields: ["title", "tutorialName", "skillsLearned", "challenges"],
  },
  {
    id: "project",
    name: "Project Milestone",
    icon: "🏆",
    fields: [
      "title",
      "projectName",
      "description",
      "skillsLearned",
      "nextSteps",
    ],
  },
];

const EditLearningProgressModal = ({
  progressEntry,
  onClose,
  onProgressUpdated,
  token,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(
    progressEntry?.templateType || "general"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    progressEntry?.status || "not_started"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: progressEntry?.title || "",
      description: progressEntry?.description || "",
      tutorialName: progressEntry?.tutorialName || "",
      projectName: progressEntry?.projectName || "",
      skillsLearned: progressEntry?.skillsLearned || "",
      challenges: progressEntry?.challenges || "",
      nextSteps: progressEntry?.nextSteps || "",
    },
  });

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate);
      const requiredFields = currentTemplate.fields.filter(
        (field) =>
          field === "title" ||
          field === "description" ||
          field === "tutorialName" ||
          field === "projectName"
      );

      const isValid = requiredFields.every((field) => data[field]?.trim());
      if (!isValid) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      const updatedData = {
        ...data,
        templateType: selectedTemplate,
        status: selectedStatus,
      };

      await updateLearningProgress(progressEntry.id, updatedData, token);
      toast.success("Progress updated successfully");
      onProgressUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating learning progress:", error);
      toast.error("Failed to update progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0  bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
      <motion.div
        className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-md m-4 overflow-hidden border border-white border-opacity-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 border-opacity-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit Learning Progress
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* progress Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Type
              </label>
              <select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                {TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.icon} {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Form Fields based on selected template */}
          <div className="space-y-4">
            {currentTemplate.fields.includes("title") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Give your progress update a clear title"
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
            )}

            {currentTemplate.fields.includes("description") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  {...register("description", {
                    required: currentTemplate.fields.includes("description")
                      ? "Description is required"
                      : false,
                  })}
                  placeholder="Describe what you've learned or accomplished"
                  rows="3"
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
            )}

            {currentTemplate.fields.includes("tutorialName") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tutorial Name*
                </label>
                <input
                  type="text"
                  {...register("tutorialName", {
                    required: currentTemplate.fields.includes("tutorialName")
                      ? "Tutorial name is required"
                      : false,
                  })}
                  placeholder="Name of the tutorial you completed"
                  className={`w-full p-2 bg-white bg-opacity-70 rounded-lg border ${
                    errors.tutorialName ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-400 focus:outline-none`}
                />
                {errors.tutorialName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.tutorialName.message}
                  </p>
                )}
              </div>
            )}

            {currentTemplate.fields.includes("projectName") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name*
                </label>
                <input
                  type="text"
                  {...register("projectName", {
                    required: currentTemplate.fields.includes("projectName")
                      ? "Project name is required"
                      : false,
                  })}
                  placeholder="Name of your project"
                  className={`w-full p-2 bg-white bg-opacity-70 rounded-lg border ${
                    errors.projectName ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-400 focus:outline-none`}
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.projectName.message}
                  </p>
                )}
              </div>
            )}

            {currentTemplate.fields.includes("skillsLearned") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills Learned
                </label>
                <input
                  type="text"
                  {...register("skillsLearned")}
                  placeholder="Skills or technologies you learned (comma-separated)"
                  className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            )}

            {currentTemplate.fields.includes("challenges") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenges Faced
                </label>
                <textarea
                  {...register("challenges")}
                  placeholder="What challenges did you encounter and how did you overcome them?"
                  rows="2"
                  className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                />
              </div>
            )}

            {currentTemplate.fields.includes("nextSteps") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Steps
                </label>
                <textarea
                  {...register("nextSteps")}
                  placeholder="What are your next steps or goals?"
                  rows="2"
                  className="w-full p-2 bg-white bg-opacity-70 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors  cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300   cursor-pointer"
              whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Progress"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditLearningProgressModal;
