// ================================ React Imports ============================ //
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ================================ Component Imports ============================ //
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Breadcrumb from "./components/Breadcrumb.tsx";
import SocialProfileCompletion from "./components/SocialProfileCompletion.tsx";

// ================================ Pages Imports ================================ //
import DashboardHome from "./pages/Dashboard.tsx";
import AssignmentsPage from "./pages/Assignments.tsx";
import EvaluationsPage from "./pages/Evaluations.tsx";
import AnalyticsPage from "./pages/Analytics.tsx";
import AchievementsPage from "./pages/Achievements.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import GoToStudentProfile from "./pages/GoToStudentProfile.tsx";
import Courses from "./pages/Courses.tsx";

// ================================ Context Imports =============================== //
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ToastProvider } from "./contexts/ToastContext.tsx"; // ← Only import ToastProvider from context
import ToastContainer from "./components/ToastContainer.tsx"; // ← Import ToastContainer from components
import { useAuth } from "./contexts/AuthContext.tsx";

// Admin Components (create these as simple placeholders)
const AdminUserManagement: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
      User Management
    </h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
      <p className="text-gray-600 dark:text-gray-400">
        Admin user management interface - coming soon...
      </p>
    </div>
  </div>
);

const AdminSystemSettings: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
      System Settings
    </h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
      <p className="text-gray-600 dark:text-gray-400">
        System settings interface - coming soon...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

// Wrapper component to handle social profile completion
const AppContent: React.FC = () => {
  const { state, completeSocialProfile } = useAuth();
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  
  useEffect(() => {
    if (state.isAuthenticated && state.needsProfileCompletion) {
      setShowProfileCompletion(true);
    }
  }, [state.isAuthenticated, state.needsProfileCompletion]);
  
  const handleProfileComplete = () => {
    setShowProfileCompletion(false);
  };
  
  const handleProfileCancel = () => {
    // Log the user out if they cancel profile completion
    setShowProfileCompletion(false);
    window.location.href = "/login";
  };
  
  return (
    <>
      <Router>
        <div className="App">
          {/* Toast container - render outside Routes */}
          <ToastContainer />
          
          {/* Social profile completion modal */}
          {showProfileCompletion && (
            <SocialProfileCompletion 
              onComplete={handleProfileComplete} 
              onCancel={handleProfileCancel} 
            />
          )}

          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Breadcrumb />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="courses" element={<Courses />} />
              <Route path="find-student" element={<GoToStudentProfile />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="evaluations" element={<EvaluationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/:userId" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Admin-only routes */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/system"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSystemSettings />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
