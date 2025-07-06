// import React, { useState } from "react";
// import { Link, Navigate } from "react-router-dom";
// import { FcGoogle } from "react-icons/fc";
// import { FaGithub } from "react-icons/fa";
// import { useAuth } from "../contexts/AuthContext";
// import { useToast } from "../components/Toast";
// import { AxiosError } from "axios";

// const Login: React.FC = () => {
//   const [formData, setFormData] = useState({
//     userEmail: "",
//     userPassword: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const { login, state } = useAuth();
//   const toast = useToast();

//   // Redirect if already authenticated
//   if (state.isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const validateForm = (): string | null => {
//     if (!formData.userEmail.trim()) {
//       return "Email is required";
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.userEmail.trim())) {
//       return "Please enter a valid email address";
//     }

//     if (!formData.userPassword.trim()) {
//       return "Password is required";
//     }

//     if (formData.userPassword.length < 6) {
//       return "Password must be at least 6 characters long";
//     }

//     return null;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Client-side validation
//     const validationError = validateForm();
//     if (validationError) {
//       toast.error(validationError, {
//         title: "Validation Error"
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       await toast.promise(
//         login(formData.userEmail, formData.userPassword),
//         {
//           loading: "Signing you in...",
//           success: (data) => {
//             // Get user role and customize welcome message
//             const user = state.user || data?.user;
//             const roleMessages = {
//               student: "Welcome back! Ready to continue your learning journey? 📚",
//               teacher: "Welcome back! Your students are waiting for you. 👨‍🏫",
//               admin: "Welcome back, Admin! The platform is at your command. 🔑"
//             };
            
//             return roleMessages[user?.userRole as keyof typeof roleMessages] || 
//                    "Welcome back! Login successful. 🎉";
//           },
//           error: (err) => {
//             if (err instanceof AxiosError) {
//               const errorData = err.response?.data;
              
//               // Handle specific HTTP status codes
//               switch (err.response?.status) {
//                 case 401:
//                   return "Invalid email or password. Please check your credentials and try again.";
//                 case 403:
//                   return "Your account has been deactivated. Please contact support for assistance.";
//                 case 404:
//                   return "No account found with this email. Would you like to register instead?";
//                 case 429:
//                   return "Too many login attempts. Please try again in a few minutes.";
//                 default:
//                   if (errorData?.message) {
//                     return errorData.message;
//                   }
//               }
//             }
            
//             return err instanceof Error ? err.message : "Login failed. Please try again.";
//           }
//         }
//       );

//       // Success - additional actions
//       if (rememberMe) {
//         // You could store user preference for "remember me"
//         localStorage.setItem("rememberMe", "true");
//       }

//       // Show welcome toast with action
//       toast.success("Redirecting to your dashboard...", {
//         title: "Login Successful",
//         duration: 2000,
//         action: {
//           label: "Go Now",
//           onClick: () => window.location.href = "/dashboard"
//         }
//       });

//     } catch (error) {
//       // Error is already handled by toast.promise
//       console.error("Login error:", error);
      
//       // Special handling for account not found
//       if (error instanceof AxiosError && error.response?.status === 404) {
//         setTimeout(() => {
//           toast.info("Don't have an account yet?", {
//             title: "New User?",
//             action: {
//               label: "Register Here",
//               onClick: () => window.location.href = "/register"
//             },
//             duration: 6000
//           });
//         }, 1000);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSocialAuth = (provider: string) => {
//     toast.info(`${provider} authentication will be available soon!`, {
//       title: "Coming Soon",
//       duration: 3000
//     });
//   };

//   const handleForgotPassword = () => {
//     toast.info("Password reset feature will be available soon!", {
//       title: "Coming Soon",
//       duration: 3000
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4">
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full space-y-6">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Welcome Back
//           </h2>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
//             Sign in to continue your journey
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <input
//               type="email"
//               name="userEmail"
//               placeholder="Email"
//               value={formData.userEmail}
//               onChange={handleInputChange}
//               required
//               disabled={isLoading}
//               className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
//             />
//           </div>
          
//           <div>
//             <input
//               type="password"
//               name="userPassword"
//               placeholder="Password"
//               value={formData.userPassword}
//               onChange={handleInputChange}
//               required
//               disabled={isLoading}
//               className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="flex items-center space-x-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 disabled={isLoading}
//                 className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//               />
//               <span className="text-sm text-gray-600 dark:text-gray-400">
//                 Remember me
//               </span>
//             </label>
            
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               disabled={isLoading}
//               className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
//             >
//               Forgot password?
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center space-x-2"
//           >
//             {isLoading ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 <span>Signing In...</span>
//               </>
//             ) : (
//               <span>Sign In</span>
//             )}
//           </button>
//         </form>

//         <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <div className="w-full border-t border-gray-300 dark:border-gray-600" />
//           </div>
//           <div className="relative flex justify-center text-sm">
//             <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
//           </div>
//         </div>

//         <div className="flex flex-col gap-3">
//           <button
//             type="button"
//             disabled={isLoading}
//             onClick={() => handleSocialAuth("Google")}
//             className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 py-3 rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50"
//           >
//             <FcGoogle size={20} />
//             <span className="text-gray-800 dark:text-gray-200">
//               Continue with Google
//             </span>
//           </button>
//           <button
//             type="button"
//             disabled={isLoading}
//             onClick={() => handleSocialAuth("GitHub")}
//             className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-lg shadow-sm hover:bg-gray-800 transition disabled:opacity-50"
//           >
//             <FaGithub size={20} />
//             <span>Continue with GitHub</span>
//           </button>
//         </div>

//         <p className="text-center text-sm text-gray-600 dark:text-gray-400">
//           Don't have an account?{" "}
//           <Link to="/register" className="text-indigo-600 hover:underline font-medium">
//             Register here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

// ================================================== //

import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { AxiosError } from "axios";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    userEmail: "",
    userPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, state } = useAuth();
  const toast = useToast();

  // Redirect if already authenticated
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.userEmail.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail.trim())) {
      return "Please enter a valid email address";
    }

    if (!formData.userPassword.trim()) {
      return "Password is required";
    }

    if (formData.userPassword.length < 6) {
      return "Password must be at least 6 characters long";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await toast.promise(login(formData.userEmail, formData.userPassword), {
        loading: "Signing you in...",
        success: (data) => {
          // Get user role and customize welcome message
          const user = state.user || data?.user;
          const roleMessages = {
            student:
              "Welcome back! Ready to continue your learning journey? 📚",
            teacher: "Welcome back! Your students are waiting for you. 👨‍🏫",
            admin: "Welcome back, Admin! The platform is at your command. 🔑",
          };

          return (
            roleMessages[user?.userRole as keyof typeof roleMessages] ||
            "Welcome back! Login successful. 🎉"
          );
        },
        error: (err) => {
          if (err instanceof AxiosError) {
            const errorData = err.response?.data;

            // Handle specific HTTP status codes
            switch (err.response?.status) {
              case 401:
                return "Invalid email or password. Please check your credentials and try again.";
              case 403:
                return "Your account has been deactivated. Please contact support for assistance.";
              case 404:
                return "No account found with this email. Would you like to register instead?";
              case 429:
                return "Too many login attempts. Please try again in a few minutes.";
              default:
                if (errorData?.message) {
                  return errorData.message;
                }
            }
          }

          return err instanceof Error
            ? err.message
            : "Login failed. Please try again.";
        },
      });

      // Success - additional actions
      if (rememberMe) {
        // You could store user preference for "remember me"
        localStorage.setItem("rememberMe", "true");
      }

      // Show welcome toast with action
      toast.success("Redirecting to your dashboard...", {
        title: "Login Successful",
        duration: 2000,
        action: {
          label: "Go Now",
          onClick: () => (window.location.href = "/dashboard"),
        },
      });
    } catch (error) {
      // Error is already handled by toast.promise
      console.error("Login error:", error);

      // Special handling for account not found
      if (error instanceof AxiosError && error.response?.status === 404) {
        setTimeout(() => {
          toast.info("Don't have an account yet?", {
            title: "New User?",
            action: {
              label: "Register Here",
              onClick: () => (window.location.href = "/register"),
            },
            duration: 6000,
          });
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    toast.info(`${provider} authentication will be available soon!`, {
      title: "Coming Soon",
      duration: 3000,
    });
  };

  const handleForgotPassword = () => {
    toast.info("Password reset feature will be available soon!", {
      title: "Coming Soon",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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

          <div>
            <input
              type="password"
              name="userPassword"
              placeholder="Password"
              value={formData.userPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
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
            onClick={() => handleSocialAuth("Google")}
            className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 py-3 rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50"
          >
            <FcGoogle size={20} />
            <span className="text-gray-800 dark:text-gray-200">
              Continue with Google
            </span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialAuth("GitHub")}
            className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-lg shadow-sm hover:bg-gray-800 transition disabled:opacity-50"
          >
            <FaGithub size={20} />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:underline font-medium"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;