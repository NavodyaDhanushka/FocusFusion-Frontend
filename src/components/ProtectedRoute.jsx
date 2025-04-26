import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  //if user not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // if user authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
