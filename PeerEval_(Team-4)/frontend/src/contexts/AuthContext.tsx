import React, { createContext, useContext, useReducer, useEffect } from "react";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";

// Types
export interface User {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: "student" | "teacher" | "admin";
  userPhoneNumber?: string;
  countryCode?: string;
  userBio?: string;
  userProfileImage?: string;
  userCoverImage?: string;
  userLocation?: {
    homeAddress?: string;
    currentAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  userAcademicInformation?: {
    institution?: string;
    degree?: string;
    major?: string;
    graduationYear?: number;
    gpa?: number;
    academicLevel?: string;
  };
  userSkills?: Array<{
    name: string;
    level: string;
    category: string;
    verified: boolean;
  }>;
  userSocialMediaProfiles?: Array<{
    platform: string;
    username: string;
    url?: string;
    verified: boolean;
  }>;
  firebaseUid?: string;
  emailVerified?: boolean;
  isActive: boolean;
  userLastLogin?: string;
  userJoiningDate?: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
  statistics?: {
    totalAssignments?: number;
    completedAssignments?: number;
    totalEvaluations?: number;
    averageScore?: number;
    achievements?: number;
  };
}

export interface RegisterData {
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhoneNumber: string;
  countryCode: string;
  userRole: "student" | "teacher" | "admin";
  userLocation: {
    homeAddress: string;
    currentAddress: string;
  };
  userBio?: string;
  userAcademicInformation?: any;
  userSkills?: any[];
  userSocialMediaProfiles?: any[];
  avatar?: File;
  coverImage?: File;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfileCompletion: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "LOGOUT" }
  | { type: "SET_NEEDS_PROFILE_COMPLETION"; payload: boolean }
  | { type: "UPDATE_USER"; payload: Partial<User> };

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  completeSocialProfile: (data: any) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  needsProfileCompletion: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    case "SET_NEEDS_PROFILE_COMPLETION":
      return {
        ...state,
        needsProfileCompletion: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const toast = useToast();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Auto-refresh token every 45 minutes
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(() => {
        refreshToken().catch(() => {
          console.log("Auto token refresh failed");
        });
      }, 45 * 60 * 1000); // 45 minutes

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated]);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        dispatch({ type: "LOGOUT" });
        return;
      }

      // Get current user info
      const response = await apiService.get("/auth/me");

      if (response.user) {
        dispatch({ type: "SET_USER", payload: response.user });

        // Check if profile completion is needed
        const needsCompletion =
          !response.user.userPhoneNumber ||
          !response.user.userLocation?.homeAddress ||
          !response.user.userLocation?.currentAddress;

        dispatch({
          type: "SET_NEEDS_PROFILE_COMPLETION",
          payload: needsCompletion,
        });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    } catch (error: any) {
      console.error("Auth status check failed:", error);

      // If token is invalid, try to refresh
      try {
        await refreshToken();
      } catch (refreshError) {
        // Refresh failed, clear auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch({ type: "LOGOUT" });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const response = await apiService.post("/auth/login", {
        userEmail: email,
        userPassword: password,
      });

      if (response.user && response.accessToken) {
        // Store tokens
        localStorage.setItem("accessToken", response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }

        dispatch({ type: "SET_USER", payload: response.user });

        // Check if profile completion is needed
        const needsCompletion =
          !response.user.userPhoneNumber ||
          !response.user.userLocation?.homeAddress ||
          !response.user.userLocation?.currentAddress;

        dispatch({
          type: "SET_NEEDS_PROFILE_COMPLETION",
          payload: needsCompletion,
        });

        toast.success(`Welcome back, ${response.user.userName}!`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      // Create FormData for file upload
      const formData = new FormData();

      // Append text fields
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof RegisterData];
        if (value !== undefined && key !== "avatar" && key !== "coverImage") {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append files
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }
      if (data.coverImage) {
        formData.append("coverImage", data.coverImage);
      }

      const response = await apiService.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.user && response.accessToken) {
        // Store tokens
        localStorage.setItem("accessToken", response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }

        dispatch({ type: "SET_USER", payload: response.user });
        dispatch({ type: "SET_NEEDS_PROFILE_COMPLETION", payload: false });

        toast.success(`Welcome to the platform, ${response.user.userName}!`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Call logout endpoint to invalidate server-side session
      try {
        await apiService.post("/auth/logout");
      } catch (error) {
        // Continue with logout even if server call fails
        console.warn("Server logout failed:", error);
      }

      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiService.post("/auth/refresh-token", {
        refreshToken,
      });

      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const response = await apiService.patch("/auth/update-profile", data);

      if (response.user || response) {
        const updatedUser = response.user || response;
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Profile update failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const completeSocialProfile = async (data: any): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const response = await apiService.post(
        "/auth/firebase/complete-profile",
        data
      );

      if (response.user || response) {
        const updatedUser = response.user || response;
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
        dispatch({ type: "SET_NEEDS_PROFILE_COMPLETION", payload: false });
        toast.success("Profile completed successfully");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Profile completion failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    completeSocialProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ================================================================================= //

// import React, {
//   createContext,
//   useContext,
//   useReducer,
//   useEffect,
//   ReactNode,
// } from "react";
// import { apiService } from "../services/api";
// import { AxiosError } from "axios";
// import { auth, getCurrentUser as getFirebaseUser } from "../services/firebase";
// // import { auth, getCurrentUser as getFirebaseUser } from "../services/firebase";

// // API Base URL - Updated to match your environment
// const API_BASE_URL = "http://localhost:8024/api/v1";

// // Types matching your backend User model
// interface User {
//   _id: string;
//   userName: string;
//   userEmail: string;
//   userRole: "student" | "teacher" | "admin";
//   userProfileImage?: string;
//   userCoverImage?: string;
//   userPhoneNumber?: string;
//   countryCode?: string;
//   userLocation?: {
//     homeAddress: string;
//     currentAddress: string;
//   };
//   userBio?: string;
//   userAcademicInformation?: {
//     universityName?: string;
//     degree?: string;
//     major?: string;
//     grade?: number;
//     graduationYear?: string;
//     startDate?: string;
//     endDate?: string;
//   };
//   userSkills?: string[];
//   userSocialMediaProfiles?: Array<{
//     platform: string;
//     profileLink: string;
//   }>;
//   userJoiningDate?: string;
//   userLastLogin?: string;
//   isActive?: boolean;
//   authProvider?: string; // Added property
// }

// interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
//   statusCode: number;
// }

// interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   refreshToken: string | null;
//   needsProfileCompletion: boolean;
//   isLoading: boolean;
//   isAuthenticated: boolean;
// }

// type AuthAction =
//   | { type: "AUTH_START" }
//   | {
//     type: "AUTH_SUCCESS";
//     payload: {
//       user: User;
//       accessToken: string;
//       refreshToken: string;
//       needsProfileCompletion?: boolean
//     };
//   }
//   | { type: "AUTH_FAILURE" }
//   | { type: "LOGOUT" }
//   | { type: "UPDATE_USER"; payload: User }
//   | {
//       type: "UPDATE_TOKENS";
//       payload: { accessToken: string; refreshToken?: string };
//     }
//   | { type: "COMPLETE_PROFILE" };

// // Registration data interface matching backend
// export interface RegisterData {
//   userName: string;
//   userEmail: string;
//   userPassword: string;
//   userPhoneNumber: string;
//   countryCode: string;
//   userLocation: {
//     homeAddress: string;
//     currentAddress: string;
//   };
//   userRole: string;
//   avatar?: File;
//   coverImage?: File;
// }

// // Initial state
// const initialState: AuthState = {
//   user: null,
//   accessToken: null,
//   refreshToken: null,
//   needsProfileCompletion: false,
//   isLoading: true,
//   isAuthenticated: false,
// };

// // Reducer
// const authReducer = (state: AuthState, action: AuthAction): AuthState => {
//   switch (action.type) {
//     case "AUTH_START":
//       return { ...state, isLoading: true };

//     case "AUTH_SUCCESS":
//       return {
//         ...state,
//         user: action.payload.user,
//         accessToken: action.payload.accessToken,
//         refreshToken: action.payload.refreshToken,
//         needsProfileCompletion: action.payload.needsProfileCompletion || false,
//         isLoading: false,
//         isAuthenticated: true,
//       };

//     case "AUTH_FAILURE":
//       return {
//         ...state,
//         user: null,
//         accessToken: null,
//         refreshToken: null,
//         needsProfileCompletion: false,
//         isLoading: false,
//         isAuthenticated: false,
//       };

//     case "LOGOUT":
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       return { ...initialState, isLoading: false };

//     case "UPDATE_USER":
//       return { ...state, user: action.payload };

//     case "UPDATE_TOKENS":
//       return {
//         ...state,
//         accessToken: action.payload.accessToken,
//         refreshToken: action.payload.refreshToken || state.refreshToken,
//       };

//     case "COMPLETE_PROFILE":
//       return {
//         ...state,
//         needsProfileCompletion: false
//       };

//     default:
//       return state;
//   }
// };

// // Context type
// interface AuthContextType {
//   state: AuthState;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: RegisterData) => Promise<void>;
//   logout: () => Promise<void>;
//   completeSocialProfile: (userData: any) => Promise<void>;
//   updateProfile: (userData: Partial<User>) => Promise<User>;
//   refreshAccessToken: () => Promise<void>;
//   getCurrentUser: () => Promise<User>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Provider component
// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   // Check for existing tokens on app start
//   useEffect(() => {
//     const checkAuth = async () => {
//       const accessToken = localStorage.getItem("accessToken");
//       const refreshToken = localStorage.getItem("refreshToken");

//       // Check Firebase auth state
//       const firebaseUser = await getFirebaseUser();

//       if (accessToken && refreshToken) {
//         try {
//           const response = await apiService.get<ApiResponse<User>>("/user/me");
//           const userData = response.data; // Directly assign the response data

//           dispatch({
//             type: "AUTH_SUCCESS",
//             payload: {
//               user: userData,
//               accessToken,
//               refreshToken,
//             },
//           });
//         } catch (error) {
//           console.error("Auth check failed:", error);
//           // Try to refresh token
//           try {
//             await refreshTokens();
//           } catch (refreshError) {
//             console.error("Token refresh failed:", refreshError);
//             dispatch({ type: "AUTH_FAILURE" });
//           }
//         }
//       } else if (firebaseUser) {
//         // User is signed in with Firebase but no tokens
//         try {
//           const idToken = await firebaseUser.getIdToken();
//           const response = await apiService.post<ApiResponse<{
//             user: User;
//             accessToken: string;
//             refreshToken: string;
//             needsProfileCompletion?: boolean;
//           }>>("/auth/firebase", { idToken });

//           const { user, accessToken, refreshToken, needsProfileCompletion } = response.data;

//           localStorage.setItem("accessToken", accessToken);
//           localStorage.setItem("refreshToken", refreshToken);

//           dispatch({
//             type: "AUTH_SUCCESS",
//             payload: { user, accessToken, refreshToken, needsProfileCompletion },
//           });
//         } catch (error) {
//           console.error("Firebase auth check failed:", error);
//           dispatch({ type: "AUTH_FAILURE" });
//         }
//       } else {
//         dispatch({ type: "AUTH_FAILURE" });
//       }
//     };

//     checkAuth();
//   }, []);
//   const refreshTokens = async () => {
//     try {
//       const response = await apiService.post<{
//         data: {
//           accessToken: string;
//           refreshToken?: string;
//         };
//       }>("/user/refresh-token");

//       const { accessToken, refreshToken } = response.data;

//       localStorage.setItem("accessToken", accessToken);
//       if (refreshToken) {
//         localStorage.setItem("refreshToken", refreshToken);
//       }

//       dispatch({
//         type: "UPDATE_TOKENS",
//         payload: { accessToken, refreshToken },
//       });

//       // Get updated user data
//       const userResponse = await apiService.get<{ data: User }>("/user/me");
//       const userData = userResponse.data
//       dispatch({ type: "UPDATE_USER", payload: userData as User });
//     } catch (error) {
//       dispatch({ type: "LOGOUT" });
//       throw error;
//     }
//   };

//   const login = async (
//     userEmail: string,
//     userPassword: string
//   ): Promise<void> => {
//     dispatch({ type: "AUTH_START" });

//     console.log("🔍 LOGIN DEBUG:");
//     console.log("📧 Email:", userEmail);
//     console.log("🔗 Request URL:", `${API_BASE_URL}/user/login`);

//     try {
//       const response = await apiService.post<{
//         success: boolean;
//         data: {
//           user: User;
//           accessToken: string;
//           refreshToken: string;
//         };
//         message: string;
//       }>("/user/login", { userEmail, userPassword });

//       console.log("✅ Login response:", response.data);

//       // Handle the response structure from your backend (ApiResponse format)
//       const responseData = response.data;

//       if (
//         !responseData ||
//         !responseData.user ||
//         !responseData.accessToken ||
//         !responseData.refreshToken
//       ) {
//         console.error("❌ Invalid response structure:", responseData);
//         throw new Error("Invalid response format from server");
//       }

//       const { user, accessToken, refreshToken } = responseData;

//       // Store tokens
//       const needsProfileCompletion = user.authProvider !== "local" &&
//         (!user.userPhoneNumber || !user.userLocation?.homeAddress || !user.userLocation?.currentAddress);

//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);

//       console.log("🔑 Tokens stored successfully");
//       console.log("👤 User data:", user);

//       dispatch({
//         type: "AUTH_SUCCESS",
//         payload: { user, accessToken, refreshToken, needsProfileCompletion },
//       });
//     } catch (error) {
//       console.error("❌ Login error:", error);
//       dispatch({ type: "AUTH_FAILURE" });

//       if (error instanceof AxiosError) {
//         const status = error.response?.status;
//         const errorData = error.response?.data;

//         console.error("🔍 Detailed error info:", {
//           status,
//           statusText: error.response?.statusText,
//           data: errorData,
//           url: error.config?.url,
//           method: error.config?.method,
//           baseURL: error.config?.baseURL,
//         });

//         // Handle specific error cases
//         let errorMessage = "Login failed";

//         if (status === 404) {
//           errorMessage =
//             "User not found. Please check your email or register first.";
//         } else if (status === 401) {
//           errorMessage =
//             "Invalid credentials. Please check your email and password.";
//         } else if (status === 403) {
//           errorMessage =
//             "Your account has been deactivated. Please contact support.";
//         } else if (status === 500) {
//           errorMessage = "Server error. Please try again later.";
//         } else if (errorData?.message) {
//           errorMessage = errorData.message;
//         } else if (
//           (typeof error === "object" && error !== null && "code" in error && error.code === "NETWORK_ERROR") ||
//           error.code === "ERR_NETWORK"
//         ) {
//           errorMessage =
//             "Cannot connect to server. Please check if the backend is running on port 8024.";
//         } else if (error.code === "ECONNREFUSED") {
//           errorMessage =
//             "Connection refused. Make sure the backend server is running on port 8024.";
//         }

//         throw new Error(errorMessage);
//       }

//       // Network or other errors
//       if (
//         (typeof error === "object" && error !== null && "code" in error && error.code === "NETWORK_ERROR") ||
//         typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string" && (error as any).message.includes("Network Error")
//       ) {
//         throw new Error(
//           "Cannot connect to server. Please check if the backend is running on port 8024."
//         );
//       }

//       throw new Error(
//         (error instanceof Error ? error.message : "An unexpected error occurred during login")
//       );
//     }
//   };

//   const register = async (userData: RegisterData): Promise<void> => {
//     dispatch({ type: "AUTH_START" });

//     try {
//       const formData = new FormData();

//       // Add text fields
//       formData.append("userName", userData.userName);
//       formData.append("userEmail", userData.userEmail);
//       formData.append("userPassword", userData.userPassword);
//       formData.append("userPhoneNumber", userData.userPhoneNumber);
//       formData.append("countryCode", userData.countryCode);
//       formData.append("userLocation", JSON.stringify(userData.userLocation));
//       formData.append("userRole", userData.userRole);

//       // Add files if present
//       if (userData.avatar) {
//         formData.append("avatar", userData.avatar);
//       }
//       if (userData.coverImage) {
//         formData.append("coverImage", userData.coverImage);
//       }

//       console.log("📤 Sending registration request...");

//       const response = await apiService.uploadFile<{
//         success: boolean;
//         data: User;
//         message: string;
//       }>("/user/register", formData);

//       console.log("✅ Registration successful:", response.data);

//       // Registration successful, now login automatically
//       await login(userData.userEmail, userData.userPassword);
//     } catch (error) {
//       console.error("❌ Registration error:", error);
//       dispatch({ type: "AUTH_FAILURE" });

//       if (error instanceof AxiosError) {
//         const errorMessage =
//           error.response?.data?.message || "Registration failed";
//         throw new Error(errorMessage);
//       }
//       throw new Error("Registration failed");
//     }
//   };

//   const logout = async (): Promise<void> => {
//     try {
//       await apiService.post("/user/logout");
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       dispatch({ type: "LOGOUT" });
//     }
//   };

//   const completeSocialProfile = async (userData: any): Promise<void> => {
//     try {
//       const response = await apiService.patch('/auth/social-profile/complete', userData);

//       // Update user in state
//       if (response) {
//         const user: User = (response as { data: User }).data; // Ensure response contains a valid User object
//         dispatch({ type: "UPDATE_USER", payload: user });
//         dispatch({ type: "COMPLETE_PROFILE" });
//       }
//     } catch (error) {
//       console.error("Error completing social profile:", error);
//       throw error;
//     }
//   };

//   const updateProfile = async (userData: Partial<User>): Promise<User> => {
//     try {
//       const response = await apiService.patch<{
//         success: boolean;
//         data: User;
//         message: string;
//       }>("/user/update-profile", userData);

//       const updatedUser = response.data;
//       dispatch({ type: "UPDATE_USER", payload: updatedUser as User });
//       return updatedUser as User;
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         const errorMessage =
//           error.response?.data?.message || "Profile update failed";
//         throw new Error(errorMessage);
//       }
//       throw new Error("Profile update failed");
//     }
//   };

//   const getCurrentUser = async (): Promise<User> => {
//     try {
//       const response = await apiService.get<{
//         success: boolean;
//         data: User;
//         message: string;
//       }>("/user/me");

//       const userData = response.data;
//       dispatch({ type: "UPDATE_USER", payload: userData as User });
//       return userData as User;
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         const errorMessage =
//           error.response?.data?.message || "Failed to fetch user";
//         throw new Error(errorMessage);
//       }
//       throw new Error("Failed to fetch user");
//     }
//   };

//   const refreshAccessToken = async (): Promise<void> => {
//     await refreshTokens();
//   };

//   const value: AuthContextType = {
//     state,
//     login,
//     register,
//     completeSocialProfile,
//     logout,
//     updateProfile,
//     refreshAccessToken,
//     getCurrentUser,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // Hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// // Export User type
// export type { User };
