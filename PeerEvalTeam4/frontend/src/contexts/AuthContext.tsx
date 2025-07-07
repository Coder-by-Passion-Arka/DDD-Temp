// import React, {
//   createContext,
//   useContext,
//   useReducer,
//   useEffect,
//   ReactNode,
// } from "react";
// import { apiService } from "../services/api";
// import { AxiosError } from "axios";

// // Types matching your backend User model
// interface User {
//   _id: string;
//   userName: string;
//   userEmail: string;
//   userRole: "student" | "teacher" | "admin";
//   userProfileImage?: string;
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
// }

// interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   refreshToken: string | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
// }

// type AuthAction =
//   | { type: "AUTH_START" }
//   | {
//       type: "AUTH_SUCCESS";
//       payload: { user: User; accessToken: string; refreshToken: string };
//     }
//   | { type: "AUTH_FAILURE" }
//   | { type: "LOGOUT" }
//   | { type: "UPDATE_USER"; payload: User }
//   | {
//       type: "UPDATE_TOKENS";
//       payload: { accessToken: string; refreshToken?: string };
//     };

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
//   avatar?: File;
//   coverImage?: File;
// }

// // Initial state
// const initialState: AuthState = {
//   user: null,
//   accessToken: null,
//   refreshToken: null,
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
//         isLoading: false,
//         isAuthenticated: true,
//       };

//     case "AUTH_FAILURE":
//       return {
//         ...state,
//         user: null,
//         accessToken: null,
//         refreshToken: null,
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

//       if (accessToken && refreshToken) {
//         try {
//           const response = await apiService.get<User>("/user/me");
//           dispatch({
//             type: "AUTH_SUCCESS",
//             payload: {
//               user: response.data,
//               accessToken,
//               refreshToken,
//             },
//           });
//         } catch (error) {
//           console.error("Auth check failed:", error);
//           dispatch({ type: "AUTH_FAILURE" });
//         }
//       } else {
//         dispatch({ type: "AUTH_FAILURE" });
//       }
//     };

//     checkAuth();
//   }, []);

//   const login = async (
//     userEmail: string,
//     userPassword: string
//   ): Promise<void> => {
//     dispatch({ type: "AUTH_START" });

//     try {
//       const response = await apiService.post<{
//         user: User;
//         accessToken: string;
//         refreshToken: string;
//       }>("/user/login", { userEmail, userPassword });

//       const { user, accessToken, refreshToken } = response.data;

//       // Store tokens
//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);

//       dispatch({
//         type: "AUTH_SUCCESS",
//         payload: { user, accessToken, refreshToken },
//       });
//     } catch (error) {
//       dispatch({ type: "AUTH_FAILURE" });

//       if (error instanceof AxiosError) {
//         throw new Error(error.response?.data?.message || "Login failed");
//       }
//       throw new Error("Login failed");
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

//       // Add files if present
//       if (userData.avatar) {
//         formData.append("avatar", userData.avatar);
//       }
//       if (userData.coverImage) {
//         formData.append("coverImage", userData.coverImage);
//       }

//       await apiService.uploadFile<User>("/user/register", formData);

//       // Registration successful, now login
//       await login(userData.userEmail, userData.userPassword);
//     } catch (error) {
//       dispatch({ type: "AUTH_FAILURE" });

//       if (error instanceof AxiosError) {
//         throw new Error(error.response?.data?.message || "Registration failed");
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

//   const updateProfile = async (userData: Partial<User>): Promise<User> => {
//     try {
//       const response = await apiService.patch<User>(
//         "/user/update-profile",
//         userData
//       );
//       dispatch({ type: "UPDATE_USER", payload: response.data });
//       return response.data;
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         throw new Error(
//           error.response?.data?.message || "Profile update failed"
//         );
//       }
//       throw new Error("Profile update failed");
//     }
//   };

//   const getCurrentUser = async (): Promise<User> => {
//     try {
//       const response = await apiService.get<User>("/user/me");
//       dispatch({ type: "UPDATE_USER", payload: response.data });
//       return response.data;
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         throw new Error(
//           error.response?.data?.message || "Failed to fetch user"
//         );
//       }
//       throw new Error("Failed to fetch user");
//     }
//   };

//   const refreshAccessToken = async (): Promise<void> => {
//     try {
//       const response = await apiService.post<{
//         accessToken: string;
//         refreshToken?: string;
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
//     } catch (error) {
//       dispatch({ type: "LOGOUT" });
//       throw error;
//     }
//   };

//   const value: AuthContextType = {
//     state,
//     login,
//     register,
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

// ================================================================================= // 

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { apiService } from "../services/api";
import { AxiosError } from "axios";
import { auth, getCurrentUser as getFirebaseUser } from "../services/firebase";

// API Base URL - Updated to match your environment
const API_BASE_URL = "http://localhost:8024/api/v1";

// Types matching your backend User model
interface User {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: "student" | "teacher" | "admin";
  userProfileImage?: string;
  userCoverImage?: string;
  userPhoneNumber?: string;
  countryCode?: string;
  userLocation?: {
    homeAddress: string;
    currentAddress: string;
  };
  userBio?: string;
  userAcademicInformation?: {
    universityName?: string;
    degree?: string;
    major?: string;
    grade?: number;
    graduationYear?: string;
    startDate?: string;
    endDate?: string;
  };
  userSkills?: string[];
  userSocialMediaProfiles?: Array<{
    platform: string;
    profileLink: string;
  }>;
  userJoiningDate?: string;
  userLastLogin?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  needsProfileCompletion: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "AUTH_START" }
  | {
    type: "AUTH_SUCCESS";
    payload: { 
      user: User; 
      accessToken: string; 
      refreshToken: string; 
      needsProfileCompletion?: boolean 
    };
  }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User }
  | {
      type: "UPDATE_TOKENS";
      payload: { accessToken: string; refreshToken?: string };
    };
  | { type: "COMPLETE_PROFILE" };

// Registration data interface matching backend
export interface RegisterData {
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhoneNumber: string;
  countryCode: string;
  userLocation: {
    homeAddress: string;
    currentAddress: string;
  };
  userRole: string;
  avatar?: File;
  coverImage?: File;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  needsProfileCompletion: false,
  isLoading: true,
  isAuthenticated: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        needsProfileCompletion: action.payload.needsProfileCompletion || false,
        isLoading: false,
        isAuthenticated: true,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        needsProfileCompletion: false,
        isLoading: false,
        isAuthenticated: false,
      };

    case "LOGOUT":
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return { ...initialState, isLoading: false };

    case "UPDATE_USER":
      return { ...state, user: action.payload };

    case "UPDATE_TOKENS":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || state.refreshToken,
      };
      
    case "COMPLETE_PROFILE":
      return {
        ...state,
        needsProfileCompletion: false
      };

    default:
      return state;
  }
};

// Context type
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  completeSocialProfile: (userData: any) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User>;
  refreshAccessToken: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing tokens on app start
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      
      // Check Firebase auth state
      const firebaseUser = await getFirebaseUser();

      if (accessToken && refreshToken) {
        try {
          const response = await apiService.get<{ data: User }>("/user/me");
          const userData = response.data?.data || response.data;

          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user: userData as User,
              accessToken,
              refreshToken,
            },
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          // Try to refresh token
          try {
            await refreshTokens();
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            dispatch({ type: "AUTH_FAILURE" });
          }
        }
      } else if (firebaseUser) {
        // User is signed in with Firebase but no tokens
        try {
          // Get the ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Send to backend to get our app tokens
          const response = await apiService.post('/auth/firebase', { idToken });
          const { user, accessToken, refreshToken, needsProfileCompletion } = response;
          
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, accessToken, refreshToken, needsProfileCompletion },
          });
        } catch (error) {
          console.error("Firebase auth check failed:", error);
          dispatch({ type: "AUTH_FAILURE" });
        }
      } else {
        dispatch({ type: "AUTH_FAILURE" });
      }
    };

    checkAuth();
  }, []);

  const refreshTokens = async () => {
    try {
      const response = await apiService.post<{
        data: {
          accessToken: string;
          refreshToken?: string;
        };
      }>("/user/refresh-token");

      const { accessToken, refreshToken } = response.data?.data || response.data;

      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      dispatch({
        type: "UPDATE_TOKENS",
        payload: { accessToken, refreshToken },
      });

      // Get updated user data
      const userResponse = await apiService.get<{ data: User }>("/user/me");
      const userData = userResponse.data?.data || userResponse.data;
      dispatch({ type: "UPDATE_USER", payload: userData as User });
    } catch (error) {
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  };

  const login = async (
    userEmail: string,
    userPassword: string
  ): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    console.log("🔍 LOGIN DEBUG:");
    console.log("📧 Email:", userEmail);
    console.log("🔗 Request URL:", `${API_BASE_URL}/user/login`);

    try {
      const response = await apiService.post<{
        success: boolean;
        data: {
          user: User;
          accessToken: string;
          refreshToken: string;
        };
        message: string;
      }>("/user/login", { userEmail, userPassword });

      console.log("✅ Login response:", response.data);

      // Handle the response structure from your backend (ApiResponse format)
      const responseData = response.data?.data || response.data;

      if (
        !responseData ||
        !responseData.user ||
        !responseData.accessToken ||
        !responseData.refreshToken
      ) {
        console.error("❌ Invalid response structure:", responseData);
        throw new Error("Invalid response format from server");
      }

      const { user, accessToken, refreshToken } = responseData;

      // Store tokens
      const needsProfileCompletion = user.authProvider !== "local" && 
        (!user.userPhoneNumber || !user.userLocation?.homeAddress || !user.userLocation?.currentAddress);
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("🔑 Tokens stored successfully");
      console.log("👤 User data:", user);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, accessToken, refreshToken, needsProfileCompletion },
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      dispatch({ type: "AUTH_FAILURE" });

      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error("🔍 Detailed error info:", {
          status,
          statusText: error.response?.statusText,
          data: errorData,
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        });

        // Handle specific error cases
        let errorMessage = "Login failed";

        if (status === 404) {
          errorMessage =
            "User not found. Please check your email or register first.";
        } else if (status === 401) {
          errorMessage =
            "Invalid credentials. Please check your email and password.";
        } else if (status === 403) {
          errorMessage =
            "Your account has been deactivated. Please contact support.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (
          error.code === "NETWORK_ERROR" ||
          error.code === "ERR_NETWORK"
        ) {
          errorMessage =
            "Cannot connect to server. Please check if the backend is running on port 8024.";
        } else if (error.code === "ECONNREFUSED") {
          errorMessage =
            "Connection refused. Make sure the backend server is running on port 8024.";
        }

        throw new Error(errorMessage);
      }

      // Network or other errors
      if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        throw new Error(
          "Cannot connect to server. Please check if the backend is running on port 8024."
        );
      }

      throw new Error(
        error.message || "An unexpected error occurred during login"
      );
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      const formData = new FormData();

      // Add text fields
      formData.append("userName", userData.userName);
      formData.append("userEmail", userData.userEmail);
      formData.append("userPassword", userData.userPassword);
      formData.append("userPhoneNumber", userData.userPhoneNumber);
      formData.append("countryCode", userData.countryCode);
      formData.append("userLocation", JSON.stringify(userData.userLocation));
      formData.append("userRole", userData.userRole);

      // Add files if present
      if (userData.avatar) {
        formData.append("avatar", userData.avatar);
      }
      if (userData.coverImage) {
        formData.append("coverImage", userData.coverImage);
      }

      console.log("📤 Sending registration request...");

      const response = await apiService.uploadFile<{
        success: boolean;
        data: User;
        message: string;
      }>("/user/register", formData);

      console.log("✅ Registration successful:", response.data);

      // Registration successful, now login automatically
      await login(userData.userEmail, userData.userPassword);
    } catch (error) {
      console.error("❌ Registration error:", error);
      dispatch({ type: "AUTH_FAILURE" });

      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || "Registration failed";
        throw new Error(errorMessage);
      }
      throw new Error("Registration failed");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.post("/user/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const completeSocialProfile = async (userData: any): Promise<void> => {
    try {
      const response = await apiService.patch('/auth/social-profile/complete', userData);
      
      // Update user in state
      if (response) {
        dispatch({ type: "UPDATE_USER", payload: response });
        dispatch({ type: "COMPLETE_PROFILE" });
      }
    } catch (error) {
      console.error("Error completing social profile:", error);
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiService.patch<{
        success: boolean;
        data: User;
        message: string;
      }>("/user/update-profile", userData);

      const updatedUser = response.data.data || response.data;
      dispatch({ type: "UPDATE_USER", payload: updatedUser as User });
      return updatedUser as User;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || "Profile update failed";
        throw new Error(errorMessage);
      }
      throw new Error("Profile update failed");
    }
  };

  const getCurrentUser = async (): Promise<User> => {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: User;
        message: string;
      }>("/user/me");

      const userData = response.data.data || response.data;
      dispatch({ type: "UPDATE_USER", payload: userData as User });
      return userData as User;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch user";
        throw new Error(errorMessage);
      }
      throw new Error("Failed to fetch user");
    }
  };

  const refreshAccessToken = async (): Promise<void> => {
    await refreshTokens();
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    completeSocialProfile,
    logout,
    updateProfile,
    refreshAccessToken,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export User type
export type { User };
