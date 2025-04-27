import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    mode: "onBlur",
  });

  const password = watch("password", "");

  const onSubmit = async (data) => {
    try {
      // Check terms agreement
      if (!data.agreeToTerms) {
        setError("agreeToTerms", {
          type: "manual",
          message: "You must agree to the terms and conditions",
        });
        return;
      }

      const newUser = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      };

      try {
        const response = await axios.post(
          `http://localhost:8080/api/auth/register`,
          newUser
        );
        if (response.data) {
          toast.success("Account created successfully");

          const loginRes = await axios.post(
            `http://localhost:8080/api/auth/login`,
            { email: data.email, password: data.password }
          );
          if (loginRes.data) {
            login(loginRes.data);
            navigate("/");
          } else {
            navigate("/login");
          }
        }
      } catch (error) {
        if (error?.response) {
          toast.error(error.response.data);
        } else {
          console.log(error);
          toast.error("Something went wrong");
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen flex bg-white">

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4C26.4 4 31.7 7.3 35 12.5C31.7 17.7 26.4 21 20 21C13.6 21 8.3 17.7 5 12.5C8.3 7.3 13.6 4 20 4ZM20 19C22.1 19 24.1 18.3 25.6 17C27.2 15.7 28 14 28 12.5C28 11 27.2 9.3 25.6 8C24.1 6.7 22.1 6 20 6C17.9 6 15.9 6.7 14.4 8C12.8 9.3 12 11 12 12.5C12 14 12.8 15.7 14.4 17C15.9 18.3 17.9 19 20 19Z"
                fill="#4F46E5"
              />
              <path
                d="M20 23C26.4 23 31.7 26.3 35 31.5C31.7 36.7 26.4 40 20 40C13.6 40 8.3 36.7 5 31.5C8.3 26.3 13.6 23 20 23ZM20 38C22.1 38 24.1 37.3 25.6 36C27.2 34.7 28 33 28 31.5C28 30 27.2 28.3 25.6 27C24.1 25.7 22.1 25 20 25C17.9 25 15.9 25.7 14.4 27C12.8 28.3 12 30 12 31.5C12 33 12.8 34.7 14.4 36C15.9 37.3 17.9 38 20 38Z"
                fill="#818CF8"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create your FocusFusion account
          </h1>
          <p className="text-gray-500 mb-8">
            Already have an FocusFusion account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={`w-full h-11 px-3 border ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                  })}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className={`w-full h-11 px-3 border ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters",
                    },
                  })}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full h-11 px-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`w-full h-11 px-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with lowercase, uppercase, number,
                and special character
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full h-11 px-3 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <div className="flex h-5 items-center">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
                    errors.agreeToTerms ? "border-red-500" : ""
                  }`}
                  {...register("agreeToTerms")}
                  onChange={() =>
                    errors.agreeToTerms && clearErrors("agreeToTerms")
                  }
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Privacy Policy
                  </a>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md h-11 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-indigo-500"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={handleGoogleLogin}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => alert("Under Developing...")}
              >
                <svg
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                  />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*right side - Workspace Image */}
      <div className="hidden md:block md:w-1/2">
        <div className="h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
            alt="Workspace with laptop and accessories"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
