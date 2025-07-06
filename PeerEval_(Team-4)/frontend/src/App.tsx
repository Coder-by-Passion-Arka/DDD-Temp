// ================================ React Imports ============================ //
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ================================ Component Imports ============================ //
import ProtectedRoute from "./components/ProtectedRoute";
import Breadcrumb from "./components/Breadcrumb";

// ================================ Pages Imports ================================ //
import DashboardHome from "./pages/Dashboard";
import AssignmentsPage from "./pages/Assignments";
import EvaluationsPage from "./pages/Evaluations";
import AnalyticsPage from "./pages/Analytics";
import AchievementsPage from "./pages/Achievements";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GoToStudentProfile from "./pages/GoToStudentProfile";
import Courses from "./pages/Courses.tsx";

// ================================ Context Imports =============================== //
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext"; // ← Only import ToastProvider from context
import ToastContainer from "./components/ToastContainer"; // ← Import ToastContainer from components

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
          <Router>
            <div className="App">
              {/* Toast container - render outside Routes */}
              <ToastContainer />

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
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
