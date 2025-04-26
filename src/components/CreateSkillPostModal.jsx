import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { createPost } from "../api/skillSharingAPI";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";

const CreatePostForm = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video' or null
  const [base64Files, setBase64Files] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      description: "",
      mediaFiles: [],
    },
  });

  const validateVideoDuration = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject("Video duration must be 30 seconds or less");
        } else {
          resolve();
        }
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file count
    if (files.length > 3) {
      toast.error("You can upload a maximum of 3 files");
      e.target.value = "";
      return;
    }

    // Determine media type of selected files
    const hasImages = files.some((file) => file.type.startsWith("image/"));
    const hasVideos = files.some((file) => file.type.startsWith("video/"));

    // Validate mixed media types
    if (hasImages && hasVideos) {
      toast.error("You can only upload either images or videos, not both");
      e.target.value = "";
      return;
    }

    const newMediaType = hasVideos ? "video" : "image";

    // Validate media type consistency with existing files
    if (mediaType && mediaType !== newMediaType) {
      toast.error(
        `You already have ${mediaType}s. You can't mix images and videos.`
      );
      e.target.value = "";
      return;
    }

    setMediaType(newMediaType);
    setIsProcessingFiles(true);

    try {
      // For videos, validate duration
      if (hasVideos) {
        try {
          await Promise.all(files.map(validateVideoDuration));
        } catch (error) {
          toast.error(error);
          e.target.value = "";
          setIsProcessingFiles(false);
          return;
        }
      }

      // Convert files to base64
      const base64Promises = files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              // Add metadata to identify file type
              resolve({
                dataUrl: reader.result,
                type: file.type.startsWith("video/") ? "video" : "image",
                fileType: file.type,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );

      // Wait for all files to be converted
      const mediaItems = await Promise.all(base64Promises);

      // Clear previous preview URLs
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });

      // Create preview URLs for selected files (for UI only)
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);

      // Store the actual base64 data with type information for the server
      const base64Urls = mediaItems.map((item) => {
        return JSON.stringify({
          dataUrl: item.dataUrl,
          type: item.type,
          fileType: item.fileType,
        });
      });

      setBase64Files(base64Urls);
      setValue("mediaFiles", files);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files");
    } finally {
      setIsProcessingFiles(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (data) => {
    if (!data.description.trim() && base64Files.length === 0) {
      toast.error("Please add a description or at least one file");
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        userId: currentUser.id,
        userName: currentUser.name,
        description: data.description,
        mediaUrls: base64Files, // Send base64 encoded files instead of blob URLs
      };

      await createPost(currentUser.id, postData, currentUser.token);

      toast.success("Post created successfully");
      reset();
      setPreviewUrls([]);
      setBase64Files([]);
      setMediaType(null);
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-md border border-white border-opacity-30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <textarea
          placeholder="Share your skills or what you're learning..."
          className={`w-full p-3 bg-white bg-opacity-60 rounded-lg ${
            errors.description ? "border-red-500" : "border-0"
          } focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none`}
          rows="3"
          {...register("description")}
          disabled={isSubmitting || isProcessingFiles}
        />

        {errors.description && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.description.message}
          </p>
        )}

        {/* Media Preview Section */}
        {isProcessingFiles ? (
          <div className="flex justify-center items-center h-40 my-3 bg-white bg-opacity-30 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600 text-sm">Processing files...</p>
            </div>
          </div>
        ) : (
          previewUrls.length > 0 && (
            <div
              className={`grid gap-2 my-3 ${
                previewUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden bg-black bg-opacity-10"
                >
                  {mediaType === "video" ? (
                    <video
                      src={url}
                      className="w-full h-40 object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      // Remove file at index
                      const newPreviewUrls = [...previewUrls];
                      const newBase64Files = [...base64Files];

                      // Revoke URL object
                      if (url.startsWith("blob:")) {
                        URL.revokeObjectURL(url);
                      }

                      newPreviewUrls.splice(index, 1);
                      newBase64Files.splice(index, 1);

                      setPreviewUrls(newPreviewUrls);
                      setBase64Files(newBase64Files);
                      setValue(
                        "mediaFiles",
                        [
                          ...document.querySelector('input[type="file"]').files,
                        ].filter((_, i) => i !== index)
                      );

                      if (newPreviewUrls.length === 0) {
                        setMediaType(null);
                      }
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white"
                    disabled={isSubmitting || isProcessingFiles}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        <div className="flex items-center justify-between mt-3">
          <label
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isSubmitting || isProcessingFiles
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white bg-opacity-40 cursor-pointer hover:bg-opacity-60"
            }`}
          >
            <span className="text-lg">📷</span>
            <span className="text-gray-700">
              {isProcessingFiles ? "Processing..." : "Add Photos/Videos"}
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting || isProcessingFiles}
            />
          </label>

          <motion.button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 cursor-pointer"
            whileHover={{ scale: isSubmitting || isProcessingFiles ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting || isProcessingFiles ? 1 : 0.95 }}
            disabled={isSubmitting || isProcessingFiles}
          >
            {isSubmitting
              ? "Sharing..."
              : isProcessingFiles
              ? "Processing..."
              : "Share"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePostForm;
