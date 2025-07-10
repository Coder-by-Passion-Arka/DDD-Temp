// import cookies from "cookies";
// import cookieParser from "cookie-parser";
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const COOKIE_ICON = (
//   <svg
//     width="32"
//     height="32"
//     viewBox="0 0 32 32"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <circle cx="16" cy="16" r="16" fill="#F5D28E" />
//     <circle cx="10" cy="12" r="2" fill="#B57B2E" />
//     <circle cx="20" cy="10" r="1.5" fill="#B57B2E" />
//     <circle cx="22" cy="18" r="1.2" fill="#B57B2E" />
//     <circle cx="14" cy="20" r="1.5" fill="#B57B2E" />
//   </svg>
// );

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8024/api";

// const defaultPrefs = {
//   appearance: {
//     theme: "system",
//     language: "en",
//     timezone: "America/New_York",
//     dateFormat: "MM/DD/YYYY",
//   },
//   notifications: { email: {}, push: {} },
//   privacy: {},
//   security: {},
//   dashboard: {},
// };

// const Preferences: React.FC = () => {
//   const [open, setOpen] = useState(false);
//   const [prefs, setPrefs] = useState<any>(defaultPrefs);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [tab, setTab] = useState("appearance");

//   useEffect(() => {
//     if (open) {
//       setLoading(true);
//       axios
//         .get(`${API_URL}/preferences/me`, { withCredentials: true })
//         .then((response) => setPrefs(response.data.preferences))
//         .catch(() => setPrefs(defaultPrefs))
//         .finally(() => setLoading(false));
//     }
//   }, [open]);

//   // Theme change (cookie)
//   useEffect(() => {
//     if (prefs.appearance?.theme) {
//       document.cookie = `theme=${prefs.appearance.theme}; path=/;`;
//       document.documentElement.setAttribute(
//         "data-theme",
//         prefs.appearance.theme
//       );
//     }
//   }, [prefs.appearance?.theme]);

//   const handleChange = (section: string, key: string, value: any) => {
//     setPrefs((prev: any) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [key]: value,
//       },
//     }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       await axios.patch(`${API_URL}/preferences/me`, prefs, {
//         withCredentials: true,
//       });
//       setOpen(false);
//     } catch (e) {
//       alert("Failed to save preferences");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Floating cookie button
//   return (
//     <>
//       <button
//         aria-label="Preferences"
//         onClick={() => setOpen(true)}
//         style={{
//           position: "fixed",
//           bottom: 32,
//           right: 32,
//           zIndex: 1000,
//           border: "none",
//           background: "none",
//           cursor: "pointer",
//           boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
//           borderRadius: "50%",
//         }}
//       >
//         {COOKIE_ICON}
//       </button>
//       {open && (
//         <div
//           style={{
//             position: "fixed",
//             bottom: 80,
//             right: 32,
//             zIndex: 1100,
//             background: "#fff",
//             borderRadius: 24,
//             boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
//             minWidth: 340,
//             maxWidth: 400,
//             padding: 24,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <h2 style={{ fontWeight: 700, fontSize: 20 }}>Preferences</h2>
//             <button
//               onClick={() => setOpen(false)}
//               style={{
//                 fontSize: 20,
//                 background: "none",
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               &times;
//             </button>
//           </div>
//           <div style={{ margin: "16px 0", display: "flex", gap: 12 }}>
//             {[
//               "appearance",
//               "notifications",
//               "privacy",
//               "security",
//               "dashboard",
//             ].map((t) => (
//               <button
//                 key={t}
//                 onClick={() => setTab(t)}
//                 style={{
//                   background: tab === t ? "#f5d28e" : "#f3f3f3",
//                   border: "none",
//                   borderRadius: 8,
//                   padding: "4px 10px",
//                   fontWeight: tab === t ? 700 : 400,
//                   cursor: "pointer",
//                 }}
//               >
//                 {t.charAt(0).toUpperCase() + t.slice(1)}
//               </button>
//             ))}
//           </div>
//           {loading ? (
//             <div>Loading...</div>
//           ) : (
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleSave();
//               }}
//             >
//               {tab === "appearance" && (
//                 <div
//                   style={{ display: "flex", flexDirection: "column", gap: 12 }}
//                 >
//                   <label>
//                     Theme:
//                     <select
//                       value={prefs.appearance?.theme || "system"}
//                       onChange={(e) =>
//                         handleChange("appearance", "theme", e.target.value)
//                       }
//                     >
//                       <option value="system">System</option>
//                       <option value="light">Light</option>
//                       <option value="dark">Dark</option>
//                     </select>
//                   </label>
//                   <label>
//                     Language:
//                     <input
//                       type="text"
//                       value={prefs.appearance?.language || "en"}
//                       onChange={(e) =>
//                         handleChange("appearance", "language", e.target.value)
//                       }
//                     />
//                   </label>
//                   <label>
//                     Timezone:
//                     <input
//                       type="text"
//                       value={prefs.appearance?.timezone || "America/New_York"}
//                       onChange={(e) =>
//                         handleChange("appearance", "timezone", e.target.value)
//                       }
//                     />
//                   </label>
//                   <label>
//                     Date Format:
//                     <select
//                       value={prefs.appearance?.dateFormat || "MM/DD/YYYY"}
//                       onChange={(e) =>
//                         handleChange("appearance", "dateFormat", e.target.value)
//                       }
//                     >
//                       <option value="MM/DD/YYYY">MM/DD/YYYY</option>
//                       <option value="DD/MM/YYYY">DD/MM/YYYY</option>
//                       <option value="YYYY-MM-DD">YYYY-MM-DD</option>
//                     </select>
//                   </label>
//                 </div>
//               )}
//               {tab === "notifications" && (
//                 <div
//                   style={{ display: "flex", flexDirection: "column", gap: 12 }}
//                 >
//                   <label>
//                     Email: Assignments
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.notifications?.email?.assignments}
//                       onChange={(e) =>
//                         handleChange("notifications", "email", {
//                           ...prefs.notifications.email,
//                           assignments: e.target.checked,
//                         })
//                       }
//                     />
//                   </label>
//                   <label>
//                     Email: Evaluations
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.notifications?.email?.evaluations}
//                       onChange={(e) =>
//                         handleChange("notifications", "email", {
//                           ...prefs.notifications.email,
//                           evaluations: e.target.checked,
//                         })
//                       }
//                     />
//                   </label>
//                   <label>
//                     Push: Enabled
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.notifications?.push?.enabled}
//                       onChange={(e) =>
//                         handleChange("notifications", "push", {
//                           ...prefs.notifications.push,
//                           enabled: e.target.checked,
//                         })
//                       }
//                     />
//                   </label>
//                 </div>
//               )}
//               {tab === "privacy" && (
//                 <div
//                   style={{ display: "flex", flexDirection: "column", gap: 12 }}
//                 >
//                   <label>
//                     Profile Visibility:
//                     <select
//                       value={prefs.privacy?.profileVisibility || "public"}
//                       onChange={(e) =>
//                         handleChange(
//                           "privacy",
//                           "profileVisibility",
//                           e.target.value
//                         )
//                       }
//                     >
//                       <option value="public">Public</option>
//                       <option value="peers">Peers</option>
//                       <option value="private">Private</option>
//                     </select>
//                   </label>
//                   <label>
//                     Show Email
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.privacy?.showEmail}
//                       onChange={(e) =>
//                         handleChange("privacy", "showEmail", e.target.checked)
//                       }
//                     />
//                   </label>
//                   <label>
//                     Show Phone
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.privacy?.showPhone}
//                       onChange={(e) =>
//                         handleChange("privacy", "showPhone", e.target.checked)
//                       }
//                     />
//                   </label>
//                 </div>
//               )}
//               {tab === "security" && (
//                 <div
//                   style={{ display: "flex", flexDirection: "column", gap: 12 }}
//                 >
//                   <label>
//                     Two Factor Enabled
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.security?.twoFactorEnabled}
//                       onChange={(e) =>
//                         handleChange(
//                           "security",
//                           "twoFactorEnabled",
//                           e.target.checked
//                         )
//                       }
//                     />
//                   </label>
//                   <label>
//                     Session Timeout (minutes)
//                     <input
//                       type="number"
//                       value={prefs.security?.sessionTimeout || 30}
//                       onChange={(e) =>
//                         handleChange(
//                           "security",
//                           "sessionTimeout",
//                           Number(e.target.value)
//                         )
//                       }
//                     />
//                   </label>
//                   <label>
//                     Login Notifications
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.security?.loginNotifications}
//                       onChange={(e) =>
//                         handleChange(
//                           "security",
//                           "loginNotifications",
//                           e.target.checked
//                         )
//                       }
//                     />
//                   </label>
//                 </div>
//               )}
//               {tab === "dashboard" && (
//                 <div
//                   style={{ display: "flex", flexDirection: "column", gap: 12 }}
//                 >
//                   <label>
//                     Default View
//                     <select
//                       value={prefs.dashboard?.defaultView || "overview"}
//                       onChange={(e) =>
//                         handleChange("dashboard", "defaultView", e.target.value)
//                       }
//                     >
//                       <option value="overview">Overview</option>
//                       <option value="assignments">Assignments</option>
//                       <option value="evaluations">Evaluations</option>
//                     </select>
//                   </label>
//                   <label>
//                     Show Stats
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.dashboard?.showStats}
//                       onChange={(e) =>
//                         handleChange("dashboard", "showStats", e.target.checked)
//                       }
//                     />
//                   </label>
//                   <label>
//                     Show Recent Activity
//                     <input
//                       type="checkbox"
//                       checked={!!prefs.dashboard?.showRecentActivity}
//                       onChange={(e) =>
//                         handleChange(
//                           "dashboard",
//                           "showRecentActivity",
//                           e.target.checked
//                         )
//                       }
//                     />
//                   </label>
//                 </div>
//               )}
//               <div
//                 style={{
//                   marginTop: 24,
//                   display: "flex",
//                   justifyContent: "flex-end",
//                   gap: 12,
//                 }}
//               >
//                 <button
//                   type="button"
//                   onClick={() => setOpen(false)}
//                   style={{ padding: "8px 16px" }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   style={{
//                     padding: "8px 16px",
//                     background: "#f5d28e",
//                     border: "none",
//                     borderRadius: 8,
//                     fontWeight: 700,
//                   }}
//                 >
//                   {saving ? "Saving..." : "Save"}
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// export default Preferences;

// ======================================================================================== // 

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Cookie,
  Palette,
  Bell,
  Shield,
  Layout,
  Book,
  Eye,
  Zap,
  Download,
  Upload,
  RotateCcw,
  X,
  Check,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Globe,
  Mail,
  Smartphone,
  Lock,
  User,
  Activity,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

// Cookie SVG Icon
const CookieIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="16" r="16" fill="#F5D28E" />
    <circle cx="10" cy="12" r="2" fill="#B57B2E" />
    <circle cx="20" cy="10" r="1.5" fill="#B57B2E" />
    <circle cx="22" cy="18" r="1.2" fill="#B57B2E" />
    <circle cx="14" cy="20" r="1.5" fill="#B57B2E" />
    <circle cx="18" cy="15" r="1" fill="#B57B2E" />
    <circle cx="12" cy="16" r="0.8" fill="#B57B2E" />
  </svg>
);

interface PreferencesData {
  appearance: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    dateFormat: string;
    fontSize: string;
    compactMode: boolean;
  };
  notifications: {
    email: {
      assignments: boolean;
      evaluations: boolean;
      deadlines: boolean;
      weeklyReports: boolean;
      achievements: boolean;
      courseUpdates: boolean;
    };
    push: {
      enabled: boolean;
      assignments: boolean;
      evaluations: boolean;
      deadlines: boolean;
      achievements: boolean;
    };
    inApp: {
      assignments: boolean;
      evaluations: boolean;
      achievements: boolean;
      messages: boolean;
    };
  };
  privacy: {
    profileVisibility: "public" | "peers" | "private";
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowPeerContact: boolean;
    showOnlineStatus: boolean;
    showActivityStatus: boolean;
    dataSharing: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    passwordChangeNotifications: boolean;
    suspiciousActivityAlerts: boolean;
    deviceManagement: boolean;
  };
  dashboard: {
    defaultView: string;
    showStats: boolean;
    showRecentActivity: boolean;
    showUpcomingDeadlines: boolean;
    showLeaderboard: boolean;
    showAchievements: boolean;
    showQuickActions: boolean;
    layoutStyle: string;
  };
  academic: {
    defaultSortOrder: string;
    showGrades: boolean;
    showProgress: boolean;
    autoSaveInterval: number;
    reminderSettings: {
      assignments: number;
      evaluations: number;
    };
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    fontSize: string;
  };
}

const Preferences: React.FC = () => {
  const { state } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch preferences when component opens
  useEffect(() => {
    if (isOpen && !preferences) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.get("/preferences/me");
      setPreferences(response.data.preferences || response.preferences);
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      setError("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError("");

      await apiService.patch("/preferences/me", preferences);
      setSuccess("Preferences saved successfully!");

      // Apply theme immediately
      if (preferences.appearance.theme) {
        document.documentElement.setAttribute(
          "data-theme",
          preferences.appearance.theme
        );
        document.cookie = `theme=${preferences.appearance.theme}; path=/; max-age=31536000`; // 1 year
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all preferences to default?"))
      return;

    try {
      setSaving(true);
      setError("");

      await apiService.post("/preferences/me/reset");
      await fetchPreferences();
      setSuccess("Preferences reset to default!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error("Error resetting preferences:", error);
      setError("Failed to reset preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.get("/preferences/me/export");
      const blob = new Blob(
        [JSON.stringify(response.data || response, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `preferences-${
        state.user?.userName?.replace(/\s+/g, "-") || "user"
      }-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess("Preferences exported successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error("Error exporting preferences:", error);
      setError("Failed to export preferences");
    }
  };

  const updatePreference = <T extends keyof PreferencesData>(
    section: T,
    key: keyof PreferencesData[T],
    value: any
  ) => {
    if (!preferences) return;

    setPreferences((prev) => {
      if (!prev) return null;

      const updated = { ...prev };
      const sectionData = updated[section];

      if (sectionData && typeof sectionData === "object") {
        (sectionData as any)[key] = value;
      }

      return updated;
    });
  };

  const updateNestedPreference = <T extends keyof PreferencesData>(
    section: T,
    subsection: string,
    key: string,
    value: any
  ) => {
    if (!preferences) return;

    setPreferences((prev) => {
      if (!prev) return null;

      const updated = { ...prev };
      const sectionData = updated[section] as any;

      if (
        sectionData &&
        typeof sectionData === "object" &&
        sectionData[subsection]
      ) {
        sectionData[subsection][key] = value;
      }

      return updated;
    });
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "dashboard", label: "Dashboard", icon: Layout },
    { id: "academic", label: "Academic", icon: Book },
    { id: "accessibility", label: "Accessibility", icon: Eye },
  ];

  const renderTabContent = () => {
    if (!preferences) return null;

    switch (activeTab) {
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() =>
                      updatePreference("appearance", "theme", value)
                    }
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      preferences.appearance.theme === value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={preferences.appearance.language}
                onChange={(e) =>
                  updatePreference("appearance", "language", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={preferences.appearance.timezone}
                onChange={(e) =>
                  updatePreference("appearance", "timezone", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Format
              </label>
              <select
                value={preferences.appearance.dateFormat}
                onChange={(e) =>
                  updatePreference("appearance", "dateFormat", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Compact Mode
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reduce spacing and padding
                </p>
              </div>
              <ToggleSwitch
                enabled={preferences.appearance.compactMode}
                onChange={(value) =>
                  updatePreference("appearance", "compactMode", value)
                }
              />
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Notifications
              </h4>
              <div className="space-y-3">
                {Object.entries(preferences.notifications.email).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={value}
                        onChange={(newValue) =>
                          updateNestedPreference(
                            "notifications",
                            "email",
                            key,
                            newValue
                          )
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Push Notifications
              </h4>
              <div className="space-y-3">
                {Object.entries(preferences.notifications.push).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={value}
                        onChange={(newValue) =>
                          updateNestedPreference(
                            "notifications",
                            "push",
                            key,
                            newValue
                          )
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                In-App Notifications
              </h4>
              <div className="space-y-3">
                {Object.entries(preferences.notifications.inApp).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={value}
                        onChange={(newValue) =>
                          updateNestedPreference(
                            "notifications",
                            "inApp",
                            key,
                            newValue
                          )
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Visibility
              </label>
              <select
                value={preferences.privacy.profileVisibility}
                onChange={(e) =>
                  updatePreference(
                    "privacy",
                    "profileVisibility",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="public">Public</option>
                <option value="peers">Peers Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.privacy)
                .filter(([key]) => key !== "profileVisibility")
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={value as boolean}
                      onChange={(newValue) =>
                        updatePreference(
                          "privacy",
                          key as keyof PreferencesData["privacy"],
                          newValue
                        )
                      }
                    />
                  </div>
                ))}
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {Object.entries(preferences.security)
                .filter(([key]) => key !== "sessionTimeout")
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={value as boolean}
                      onChange={(newValue) =>
                        updatePreference(
                          "security",
                          key as keyof PreferencesData["security"],
                          newValue
                        )
                      }
                    />
                  </div>
                ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={preferences.security.sessionTimeout}
                onChange={(e) =>
                  updatePreference(
                    "security",
                    "sessionTimeout",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="0">Never</option>
              </select>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default View
              </label>
              <select
                value={preferences.dashboard.defaultView}
                onChange={(e) =>
                  updatePreference("dashboard", "defaultView", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="overview">Overview</option>
                <option value="assignments">Assignments</option>
                <option value="evaluations">Evaluations</option>
                <option value="achievements">Achievements</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout Style
              </label>
              <select
                value={preferences.dashboard.layoutStyle}
                onChange={(e) =>
                  updatePreference("dashboard", "layoutStyle", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.dashboard)
                .filter(
                  ([key]) => !["defaultView", "layoutStyle"].includes(key)
                )
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={value as boolean}
                      onChange={(newValue) =>
                        updatePreference(
                          "dashboard",
                          key as keyof PreferencesData["dashboard"],
                          newValue
                        )
                      }
                    />
                  </div>
                ))}
            </div>
          </div>
        );

      case "academic":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Sort Order
              </label>
              <select
                value={preferences.academic.defaultSortOrder}
                onChange={(e) =>
                  updatePreference(
                    "academic",
                    "defaultSortOrder",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-Save Interval (minutes)
              </label>
              <select
                value={preferences.academic.autoSaveInterval}
                onChange={(e) =>
                  updatePreference(
                    "academic",
                    "autoSaveInterval",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1 minute</option>
                <option value="2">2 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Reminder Settings
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment Reminders (hours before deadline)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={preferences.academic.reminderSettings.assignments}
                  onChange={(e) =>
                    updateNestedPreference(
                      "academic",
                      "reminderSettings",
                      "assignments",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Evaluation Reminders (hours before deadline)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={preferences.academic.reminderSettings.evaluations}
                  onChange={(e) =>
                    updateNestedPreference(
                      "academic",
                      "reminderSettings",
                      "evaluations",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.academic)
                .filter(
                  ([key]) =>
                    ![
                      "defaultSortOrder",
                      "autoSaveInterval",
                      "reminderSettings",
                    ].includes(key)
                )
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={value as boolean}
                      onChange={(newValue) =>
                        updatePreference(
                          "academic",
                          key as keyof PreferencesData["academic"],
                          newValue
                        )
                      }
                    />
                  </div>
                ))}
            </div>
          </div>
        );

      case "accessibility":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size
              </label>
              <select
                value={preferences.accessibility.fontSize}
                onChange={(e) =>
                  updatePreference("accessibility", "fontSize", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.accessibility)
                .filter(([key]) => key !== "fontSize")
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={value as boolean}
                      onChange={(newValue) =>
                        updatePreference(
                          "accessibility",
                          key as keyof PreferencesData["accessibility"],
                          newValue
                        )
                      }
                    />
                  </div>
                ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Cookie Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
        aria-label="Open Preferences"
      >
        <CookieIcon />
      </motion.button>

      {/* Preferences Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Preferences
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-col lg:flex-row max-h-[calc(90vh-140px)]">
                {/* Sidebar */}
                <div className="w-full lg:w-64 border-r border-gray-200 dark:border-gray-700 p-4">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {tab.label}
                          </span>
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                  ) : (
                    <>
                      {/* Status Messages */}
                      {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-red-800 dark:text-red-200">
                            {error}
                          </span>
                        </div>
                      )}

                      {success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 dark:text-green-200">
                            {success}
                          </span>
                        </div>
                      )}

                      {/* Tab Content */}
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 capitalize">
                          {activeTab} Settings
                        </h3>
                        {renderTabContent()}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Preferences;