import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signInWithGoogle, signInWithGithub } from "../services/firebase";
// import { signInWithGoogle, signInWithGithub } from "../services/firebase";
import { useAuth, RegisterData } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { AxiosError } from "axios";
import { apiService } from "../services/api";
import { AxiosResponse } from "axios";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

enum UserRole {
  TEACHER = "teacher",
  STUDENT = "student",
  ADMIN = "admin",
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    userName: "",
    userEmail: "",
    userPassword: "",
    userPhoneNumber: "",
    countryCode: "+91",
    userLocation: {
      homeAddress: "",
      currentAddress: "",
    },
    userRole: "student", // Default role
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, state } = useAuth();
  const toast = useToast();

  // Redirect if already authenticated
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof RegisterData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.userName.trim()) {
      return "Full name is required";
    }

    if (!formData.userEmail.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail.trim())) {
      return "Please enter a valid email address";
    }

    if (!formData.userPhoneNumber.trim()) {
      return "Phone number is required";
    }

    if (!formData.userLocation.homeAddress.trim()) {
      return "Home address is required";
    }

    if (!formData.userLocation.currentAddress.trim()) {
      return "Current address is required";
    }

    if (!formData.userRole) {
      return "Please select a role";
    }

    if (formData.userPassword.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (formData.userPassword !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError, {
        title: "Validation Error",
      });
      return;
    }

    setIsLoading(true);

    try {
      await toast.promise(register(formData), {
        loading: "Creating your account...",
        success: (data) => {
          // Customize success message based on role
          const roleMessages = {
            student:
              "Welcome to the platform! Your student account has been created successfully. 🎓",
            teacher:
              "Welcome aboard! Your teacher account has been created successfully. 👨‍🏫",
            admin:
              "Admin account created successfully! You now have full access to the platform. 🔑",
          };
          return (
            roleMessages[formData.userRole as keyof typeof roleMessages] ||
            "Account created successfully! Welcome to the platform! 🎉"
          );
        },
        error: (err) => {
          if (err instanceof AxiosError) {
            const errorData = err.response?.data;

            // Handle specific error cases
            if (err.response?.status === 409) {
              return "An account with this email already exists. Please try logging in instead.";
            }

            if (errorData?.message) {
              return errorData.message;
            }

            // Handle validation errors from backend
            if (errorData?.errors && Array.isArray(errorData.errors)) {
              return `Registration failed: ${errorData.errors.join(", ")}`;
            }
          }

          return err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        },
      });

      // Success notification with additional action
      toast.success("You're all set! Redirecting to your dashboard...", {
        title: "Registration Complete",
        duration: 3000,
        action: {
          label: "Go to Dashboard",
          onClick: () => (window.location.href = "/dashboard"),
        },
      });
    } catch (error) {
      // Error is already handled by toast.promise, but we can log for debugging
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    const authPromise =
      provider.toLowerCase() === "google" ? signInWithGoogle() : signInWithGithub();

    toast
      .promise(authPromise, {
        loading: `Signing up with ${provider}...`,
        success: `${provider} authentication successful!`,
        error: (err) => `${provider} authentication failed: ${err?.message || "Unknown error"}`,
      })
      .then(async (user) => {
        if (user) {
          try {
            const idToken = await user.getIdToken();
            const response: AxiosResponse<AuthResponse> = await apiService.post("/auth/firebase", { idToken });
            const { accessToken, refreshToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            window.location.href = "/dashboard";
          } catch (error) {
            console.error("Token exchange or storage failed:", error);
            toast.error("Login failed after authentication. Please try again.");
          }
        }
      })
      .catch((err) => {
        console.error("Social auth error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create an Account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Join our platform and start your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-2">
            <input
              type="text"
              name="userName"
              placeholder="Full Name"
              value={formData.userName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
            <input
              type="email"
              name="userEmail"
              placeholder="Email"
              value={formData.userEmail}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="+1">+1 (US)</option>
              <option value="+91">+91 (IN)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+33">+33 (FR)</option>
              <option value="+49">+49 (DE)</option>
            </select>
            <input
              type="tel"
              name="userPhoneNumber"
              placeholder="Phone Number"
              value={formData.userPhoneNumber}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="md:col-span-2 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <input
            type="text"
            name="userLocation.homeAddress"
            placeholder="Home Address"
            value={formData.userLocation.homeAddress}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          />

          <input
            type="text"
            name="userLocation.currentAddress"
            placeholder="Current Address"
            value={formData.userLocation.currentAddress}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="userPassword"
              placeholder="Password (min 8 characters)"
              value={formData.userPassword}
              onChange={handleInputChange}
              required
              minLength={8}
              disabled={isLoading}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={isLoading}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Your Role <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userRole"
                  value={UserRole.STUDENT}
                  checked={formData.userRole === UserRole.STUDENT}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Student
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userRole"
                  value={UserRole.TEACHER}
                  checked={formData.userRole === UserRole.TEACHER}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Teacher
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userRole"
                  value={UserRole.ADMIN}
                  checked={formData.userRole === UserRole.ADMIN}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Admin</span>
              </label>
            </div>
          </div>

          {/* Optional file uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture (optional)
              </label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image (optional)
              </label>
              <input
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialAuth("google")}
            className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 py-3 rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50"
          >
            <FcGoogle size={20} />
            <span className="text-gray-800 dark:text-gray-200">
              Sign up with Google
            </span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialAuth("github")}
            className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-lg shadow-sm hover:bg-gray-800 transition disabled:opacity-50"
          >
            <FaGithub size={20} />
            <span>Sign up with GitHub</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;