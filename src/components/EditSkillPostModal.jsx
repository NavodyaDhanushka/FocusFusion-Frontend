import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X, Image, Video } from "lucide-react";
import { updatePost } from "../api/skillSharingAPI";
import toast from "react-hot-toast";

const EditPostModal = ({ post, onClose, onPostUpdated, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [replaceMedia, setReplaceMedia] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      description: post?.description || "",
    },
  });

  // Determine existing media type and count.
  const existingMediaCount = post?.mediaUrls?.length || 0;
  const existingMediaType = post?.mediaUrls?.some(
    (url) =>
      (typeof url === "string" &&
        (url.includes("video") || url.includes("data:video/"))) ||
      (typeof url === "object" && url?.type === "video")
  )
    ? "video"
    : "image";

  const validateVideoDuration = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject("Video must be 30 seconds or less");
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

      // Store the processed media items
      const base64Urls = mediaItems.map((item) => {
        return JSON.stringify({
          dataUrl: item.dataUrl,
          type: item.type,
          fileType: item.fileType,
        });
      });

      setNewMedia(base64Urls);
      setMediaType(newMediaType);
      setReplaceMedia(true);

      toast.success(`${files.length} new files ready to upload`);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files");
    } finally {
      setIsProcessingFiles(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Only replace media if new files were uploaded
      const updatedPostData = {
        description: data.description,
        mediaUrls: replaceMedia ? newMedia : post.mediaUrls,
      };

      await updatePost(post.id, updatedPostData, token);
      toast.success("Post updated successfully");
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black[600] bg-opacity-70 backdrop-blur-[6px] flex justify-center items-center z-50">
      <motion.div
        className="bg-white rounded-lg shadow-lg w-full max-w-md m-4 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Edit Post</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="mb-4">
            <textarea
              className={`w-full p-3 bg-white bg-opacity-60 rounded-lg border ${
                errors.description ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none`}
              placeholder="Share your skills or what you're learning..."
              rows="4"
              {...register("description", {
                required: "Description is required",
              })}
              disabled={isSubmitting || isProcessingFiles}
            />
            {errors.description && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Media Section */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Media</h4>

            {/* Existing media info */}
            {existingMediaCount > 0 && !replaceMedia ? (
              <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-100 flex items-center">
                {existingMediaType === "video" ? (
                  <Video className="text-blue-500 mr-2" size={20} />
                ) : (
                  <Image className="text-blue-500 mr-2" size={20} />
                )}
                <div>
                  <p className="text-sm text-blue-700">
                    Currently has {existingMediaCount} {existingMediaType}
                    {existingMediaCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Upload new files below to replace existing media
                  </p>
                </div>
              </div>
            ) : null}

            {/* New media status */}
            {replaceMedia && (
              <div className="mb-3 p-3 bg-green-50 rounded border border-green-100">
                <p className="text-sm text-green-700 flex items-center">
                  {mediaType === "video" ? (
                    <Video className="text-green-500 mr-2" size={18} />
                  ) : (
                    <Image className="text-green-500 mr-2" size={18} />
                  )}
                  {newMedia.length} new {mediaType}
                  {newMedia.length > 1 ? "s" : ""} ready to upload
                </p>
                <button
                  type="button"
                  className="text-xs text-red-500 mt-1 cursor-pointer hover:font-bold"
                  onClick={() => {
                    setNewMedia([]);
                    setReplaceMedia(false);
                  }}
                >
                  Cancel and keep existing media
                </button>
              </div>
            )}

            {/* File upload */}
            {isProcessingFiles ? (
              <div className="flex justify-center items-center h-20 bg-white bg-opacity-30 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-gray-600 text-sm">Processing files...</p>
                </div>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg transition-all duration-200 ${
                  isSubmitting || isProcessingFiles
                    ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                    : "border-blue-300 bg-blue-50 cursor-pointer hover:bg-blue-100"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-blue-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-1 text-sm text-blue-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-blue-400">
                    Images (JPG, PNG, GIF) or Videos (MP4, WebM) up to 30
                    seconds
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting || isProcessingFiles}
                />
              </label>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <motion.button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 cursor-pointer"
              whileHover={{
                scale: isSubmitting || isProcessingFiles ? 1 : 1.05,
              }}
              whileTap={{ scale: isSubmitting || isProcessingFiles ? 1 : 0.95 }}
              disabled={isSubmitting || isProcessingFiles}
            >
              {isSubmitting
                ? "Updating..."
                : isProcessingFiles
                ? "Processing..."
                : "Update Post"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditPostModal;
