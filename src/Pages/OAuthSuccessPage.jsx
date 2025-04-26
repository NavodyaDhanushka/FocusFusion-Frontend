import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/auth/useAuth";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        //get user data from OAuth success endpoint
        const response = await axios.get(
          "http://localhost:8080/api/auth/oauth2/success",
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          //store user data in context and local storage
          login(response.data);
          navigate("/");
        }
      } catch (error) {
        console.error("OAuth login error:", error);
        setError("Failed to complete authentication. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [login, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-opacity-20 border-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-800">
            Completing your sign in...
          </h2>
          <p className="text-gray-600 mt-2">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-opacity-20 border-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-medium text-gray-800">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  return null;
};

export default OAuthSuccessPage;
