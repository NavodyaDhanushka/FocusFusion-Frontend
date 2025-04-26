import { useState, useCallback } from "react";

const useConfirmModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
    confirmButtonClass: "",
    type: "danger", // 'danger', 'warning', or 'info'
  });

  const openModal = useCallback(
    ({
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      onConfirm = () => {},
      confirmButtonClass = "bg-red-500 hover:bg-red-600",
      type = "danger",
    }) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        confirmButtonClass,
        type,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
  };
};

export default useConfirmModal;
