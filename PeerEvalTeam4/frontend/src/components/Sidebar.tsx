import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Target,
  BarChart3,
  Trophy,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Users,
  Search,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  mobileMenuOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  mobileMenuOpen = false,
  onMobileToggle,
}) => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  // Get user role with fallback
  const userRole = state.user?.userRole || "student";

  // Base menu items available to all users
  const baseMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["student", "teacher", "admin"],
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
      roles: ["student", "teacher", "admin"],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
      roles: ["student", "teacher", "admin"],
    },
  ];

  // Student-specific menu items
  const studentMenuItems = [
    {
      id: "assignments",
      label: "Assignments",
      icon: FileText,
      path: "/assignments",
      roles: ["student"],
    },
    {
      id: "evaluations",
      label: "Evaluations",
      icon: Target,
      path: "/evaluations",
      roles: ["student"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      roles: ["student"],
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Trophy,
      path: "/achievements",
      roles: ["student"],
    },
  ];

  // Teacher-specific menu items
  const teacherMenuItems = [
    {
      id: "assignments",
      label: "Assignments",
      icon: FileText,
      path: "/assignments",
      roles: ["teacher"],
    },
    {
      id: "students",
      label: "Students",
      icon: Users,
      path: "/students",
      roles: ["teacher"],
    },
    {
      id: "find-student",
      label: "Find Student",
      icon: Search,
      path: "/find-student",
      roles: ["teacher"],
    },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      path: "/courses",
      roles: ["teacher"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      roles: ["teacher"],
    },
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    {
      id: "admin-users",
      label: "User Management",
      icon: Users,
      path: "/admin/users",
      roles: ["admin"],
    },
    {
      id: "admin-system",
      label: "System Settings",
      icon: Shield,
      path: "/admin/system",
      roles: ["admin"],
    },
    {
      id: "find-student",
      label: "Find Student",
      icon: Search,
      path: "/find-student",
      roles: ["admin"],
    },
    {
      id: "find-teacher",
      label: "Find Student",
      icon: Search,
      path: "/find-teacher",
      roles: ["admin"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      roles: ["admin"],
    },
  ];

  // Combine menu items based on user role and render the sidebar accordingly
  const getMenuItems = () => {
    let menuItems = [...baseMenuItems];

    switch (userRole) {
      case "teacher":
        menuItems = [...menuItems, ...teacherMenuItems];
        break;
      case "admin":
        menuItems = [...menuItems, ...adminMenuItems];
        break;
      default: // student
        menuItems = [...menuItems, ...studentMenuItems];
        break;
    }

    // Filter items based on user role
    return menuItems.filter((item) => item.roles.includes(userRole));
  };

  // Get the combined menu items based on user role
  const menuItems = getMenuItems();

  // Handle navigation click event
  const handleNavClick = () => {
    if (onMobileToggle) {
      onMobileToggle();
    }
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  // Utility function to get role color based on role
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "teacher":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Utility function to get role based gradient based on role
  const getRoleBasedGradient = (role: string) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-red-600";
      case "teacher":
        return "from-blue-500 to-blue-600";
      case "student":
        return "from-emerald-500 to-emerald-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Render menu item based on item and isMobile flag
  const renderMenuItem = (
    item: any, 
    isMobile: boolean = false
  ) => {
    const Icon = item.icon;
    const isAdminItem =
      item.roles.includes("admin") &&
      !item.roles.includes("teacher") &&
      !item.roles.includes("student");

    return (
      <li key={item.id}>
        <NavLink
          to={item.path}
          onClick={isMobile ? handleNavClick : undefined}
          className={({ isActive }) =>
            `w-full flex items-center ${
              isCollapsed && !isMobile
                ? "justify-center px-3 py-3"
                : "space-x-3 px-3 py-2.5"
            } rounded-xl transition-all duration-200 group ${
              isActive
                ? isAdminItem
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                  : userRole === "teacher"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : isAdminItem
                ? "text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`
          }
          title={isCollapsed && !isMobile ? item.label : undefined}
        >
          {({ isActive }) => (
            <>
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive
                    ? "text-white"
                    : "group-hover:scale-110 transition-transform duration-200"
                }`}
              />
              {(!isCollapsed || isMobile) && (
                <span className="font-medium">{item.label}</span>
              )}
            </>
          )}
        </NavLink>
      </li>
    );
  };

  // Render user info based on isMobile flag
  const renderUserInfo = (
    isMobile: boolean = false // Used to check if screen config is mobile or desktop and render the sidebar accordingly
  ) => (
    <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRoleBasedGradient(
          userRole
        )} flex items-center justify-center`}
      >
        <span className="text-white text-sm font-semibold">
          {state.user?.userName
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "U"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {state.user?.userName || "User"}
        </p>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(
              userRole
            )}`}
          >
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 hidden lg:block ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    PeerEval
                  </span>
                </div>
              )}
              <button
                onClick={onToggle}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ${
                  isCollapsed ? "mx-auto" : ""
                }`}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {/* Role indicator when collapsed */}
              {isCollapsed && (
                <li className="mb-4">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full bg-gradient-to-br ${getRoleBasedGradient(
                      userRole
                    )} flex items-center justify-center`}
                    title={`${
                      userRole.charAt(0).toUpperCase() + userRole.slice(1)
                    } Dashboard`}
                  >
                    {userRole === "admin" ? (
                      <Shield className="w-4 h-4 text-white" />
                    ) : userRole === "teacher" ? (
                      <BookOpen className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                </li>
              )}

              {/* Menu Items */}
              {menuItems.map((item) => renderMenuItem(item, false))}
            </ul>
          </nav>

          {/* Enhanced Footer with Logout */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {/* User Info */}
                {renderUserInfo(false)}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Collapsed State Logout */}
          {isCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-30 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                PeerEval
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {/* Role indicator */}
              <li className="mb-4">
                <div
                  className={`p-2 rounded-lg ${getRoleColor(
                    userRole
                  )} text-center`}
                >
                  <span className="text-xs font-medium">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}{" "}
                    Dashboard
                  </span>
                </div>
              </li>

              {/* Menu Items */}
              {menuItems.map((item) => renderMenuItem(item, true))}
            </ul>
          </nav>

          {/* Enhanced Mobile Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {/* User Info */}
              {renderUserInfo(true)}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
