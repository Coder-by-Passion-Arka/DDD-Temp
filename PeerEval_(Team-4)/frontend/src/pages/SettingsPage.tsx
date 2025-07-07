// import React, { useState } from 'react';
// import {
//   Settings,
//   Bell,
//   Shield,
//   Palette,
//   Globe,
//   Download,
//   Trash2,
//   Eye,
//   EyeOff,
//   Save,
//   RefreshCw,
//   AlertTriangle,
//   Check
// } from 'lucide-react';

// const SettingsPage: React.FC = () => {
//   const [settings, setSettings] = useState({
//     // Notification Settings
//     emailNotifications: true,
//     pushNotifications: true,
//     assignmentReminders: true,
//     evaluationDeadlines: true,
//     weeklyReports: false,
    
//     // Privacy Settings
//     profileVisibility: 'public',
//     showEmail: false,
//     showPhone: false,
//     allowPeerContact: true,
    
//     // Appearance Settings
//     theme: 'system',
//     language: 'en',
//     timezone: 'America/New_York',
    
//     // Account Settings
//     twoFactorEnabled: false,
//     sessionTimeout: '30',
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [passwords, setPasswords] = useState({
//     current: '',
//     new: '',
//     confirm: ''
//   });
//   const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

//   const handleSettingChange = (key: string, value: any) => {
//     setSettings(prev => ({ ...prev, [key]: value }));
//   };

//   const handlePasswordChange = (field: string, value: string) => {
//     setPasswords(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSaveSettings = async () => {
//     setSaveStatus('saving');
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     setSaveStatus('saved');
//     setTimeout(() => setSaveStatus('idle'), 2000);
//   };

//   const handlePasswordUpdate = async () => {
//     if (passwords.new !== passwords.confirm) {
//       alert('New passwords do not match');
//       return;
//     }
//     // Simulate password update
//     setSaveStatus('saving');
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     setSaveStatus('saved');
//     setPasswords({ current: '', new: '', confirm: '' });
//     setTimeout(() => setSaveStatus('idle'), 2000);
//   };

//   const handleExportData = () => {
//     // Simulate data export
//     const data = {
//       profile: 'User profile data...',
//       assignments:  'Assignment history...',
//       evaluations: 'Evaluation records...'
//     };
//     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'peer-eval-data.json';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
//     <button
//       onClick={() => onChange(!enabled)}
//       className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 ${
//         enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
//       }`}
//     >
//       <span
//         className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
//           enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
//         }`}
//       />
//     </button>
//   );

//   return (
//     <div className="space-y-6 sm:space-y-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
//         <div>
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3">
//             Settings
//           </h1>
//           <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
//             Customize your experience and manage your account preferences
//           </p>
//         </div>
        
//         <button
//           onClick={handleSaveSettings}
//           disabled={saveStatus === 'saving'}
//           className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-colors duration-200 w-full sm:w-auto"
//         >
//           {saveStatus === 'saving' ? (
//             <RefreshCw className="w-4 h-4 animate-spin" />
//           ) : saveStatus === 'saved' ? (
//             <Check className="w-4 h-4" />
//           ) : (
//             <Save className="w-4 h-4" />
//           )}
//           <span>
//             {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
//           </span>
//         </button>
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
//         {/* Notification Settings */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
//           <div className="flex items-center space-x-3 mb-4 sm:mb-6">
//             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
//               <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
//               <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage your notification preferences</p>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Email Notifications</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.emailNotifications}
//                 onChange={(value) => handleSettingChange('emailNotifications', value)}
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Push Notifications</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Browser push notifications</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.pushNotifications}
//                 onChange={(value) => handleSettingChange('pushNotifications', value)}
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Assignment Reminders</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Reminders for upcoming assignments</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.assignmentReminders}
//                 onChange={(value) => handleSettingChange('assignmentReminders', value)}
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Evaluation Deadlines</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Notifications for evaluation deadlines</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.evaluationDeadlines}
//                 onChange={(value) => handleSettingChange('evaluationDeadlines', value)}
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Weekly Reports</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Weekly progress summaries</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.weeklyReports}
//                 onChange={(value) => handleSettingChange('weeklyReports', value)}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Privacy Settings */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
//           <div className="flex items-center space-x-3 mb-4 sm:mb-6">
//             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
//               <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Privacy</h3>
//               <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Control your privacy settings</p>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Profile Visibility
//               </label>
//               <select
//                 value={settings.profileVisibility}
//                 onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//               >
//                 <option value="public">Public</option>
//                 <option value="peers">Peers Only</option>
//                 <option value="private">Private</option>
//               </select>
//             </div>

//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Show Email Address</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Display email on your profile</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.showEmail}
//                 onChange={(value) => handleSettingChange('showEmail', value)}
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Show Phone Number</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Display phone on your profile</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.showPhone}
//                 onChange={(value) => handleSettingChange('showPhone', value)}
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Allow Peer Contact</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Let peers contact you directly</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.allowPeerContact}
//                 onChange={(value) => handleSettingChange('allowPeerContact', value)}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Appearance Settings */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
//           <div className="flex items-center space-x-3 mb-4 sm:mb-6">
//             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
//               <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
//               <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Customize the look and feel</p>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Theme
//               </label>
//               <select
//                 value={settings.theme}
//                 onChange={(e) => handleSettingChange('theme', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//               >
//                 <option value="light">Light</option>
//                 <option value="dark">Dark</option>
//                 <option value="system">System</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Language
//               </label>
//               <select
//                 value={settings.language}
//                 onChange={(e) => handleSettingChange('language', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//               >
//                 <option value="en">English</option>
//                 <option value="es">Spanish</option>
//                 <option value="fr">French</option>
//                 <option value="de">German</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Timezone
//               </label>
//               <select
//                 value={settings.timezone}
//                 onChange={(e) => handleSettingChange('timezone', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//               >
//                 <option value="America/New_York">Eastern Time</option>
//                 <option value="America/Chicago">Central Time</option>
//                 <option value="America/Denver">Mountain Time</option>
//                 <option value="America/Los_Angeles">Pacific Time</option>
//                 <option value="UTC">UTC</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Security Settings */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
//           <div className="flex items-center space-x-3 mb-4 sm:mb-6">
//             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
//               <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
//               <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage your account security</p>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Two-Factor Authentication</p>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
//               </div>
//               <ToggleSwitch
//                 enabled={settings.twoFactorEnabled}
//                 onChange={(value) => handleSettingChange('twoFactorEnabled', value)}
//               />
//             </div>

//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Session Timeout (minutes)
//               </label>
//               <select
//                 value={settings.sessionTimeout}
//                 onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//               >
//                 <option value="15">15 minutes</option>
//                 <option value="30">30 minutes</option>
//                 <option value="60">1 hour</option>
//                 <option value="120">2 hours</option>
//                 <option value="0">Never</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Password Change Section */}
//       <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
//         <div className="flex items-center space-x-3 mb-4 sm:mb-6">
//           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
//             <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//           </div>
//           <div>
//             <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Current Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={passwords.current}
//                 onChange={(e) => handlePasswordChange('current', e.target.value)}
//                 className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//               >
//                 {showPassword ? (
//                   <EyeOff className="w-4 h-4 text-gray-400" />
//                 ) : (
//                   <Eye className="w-4 h-4 text-gray-400" />
//                 )}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               New Password
//             </label>
//             <input
//               type={showPassword ? 'text' : 'password'}
//               value={passwords.new}
//               onChange={(e) => handlePasswordChange('new', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Confirm New Password
//             </label>
//             <input
//               type={showPassword ? 'text' : 'password'}
//               value={passwords.confirm}
//               onChange={(e) => handlePasswordChange('confirm', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//             />
//           </div>
//         </div>

//         <div className="mt-4">
//           <button
//             onClick={handlePasswordUpdate}
//             disabled={!passwords.current || !passwords.new || !passwords.confirm}
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm"
//           >
//             Update Password
//           </button>
//         </div>
//       </div>

//       {/* Data Management */}
//       <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
//         <div className="flex items-center space-x-3 mb-4 sm:mb-6">
//           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
//             <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//           </div>
//           <div>
//             <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Data Management</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Export or delete your data</p>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-4">
//           <button
//             onClick={handleExportData}
//             className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 text-sm"
//           >
//             <Download className="w-4 h-4" />
//             <span>Export My Data</span>
//           </button>

//           <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm">
//             <Trash2 className="w-4 h-4" />
//             <span>Delete Account</span>
//           </button>
//         </div>

//         <div className="mt-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
//           <div className="flex items-start space-x-2">
//             <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
//             <div>
//               <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">Data Export Notice</p>
//               <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
//                 Your exported data will include your profile information, assignment history, and evaluation records. 
//                 Account deletion is permanent and cannot be undone.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsPage;

// ====================================================================== //

import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
// import { apiService } from "../services/api";

interface UserSettings {
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  assignmentReminders: boolean;
  evaluationDeadlines: boolean;
  weeklyReports: boolean;

  // Privacy Settings
  profileVisibility: "public" | "peers" | "private";
  showEmail: boolean;
  showPhone: boolean;
  allowPeerContact: boolean;

  // Appearance Settings
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;

  // Account Settings
  twoFactorEnabled: boolean;
  sessionTimeout: string;
}

const SettingsPage: React.FC = () => {
  const { state, updateProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    // Default settings
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    evaluationDeadlines: true,
    weeklyReports: false,
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowPeerContact: true,
    theme: "system",
    language: "en",
    timezone: "America/New_York",
    twoFactorEnabled: false,
    sessionTimeout: "30",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!state.user) return;

      try {
        setIsLoading(true);

        // For now, we'll use default settings since backend endpoints might not exist yet
        // In production, replace this with actual API calls

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // TODO: Replace with actual API call when backend endpoint is ready
        /*
        const response = await apiService.get('/user/settings');
        const userSettings: UserSettings = response.data;
        setSettings(userSettings);
        */

        // Use default settings for now
        setSettings((prev) => prev);
      } catch (error) {
        console.error("Error fetching user settings:", error);
        setError("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [state.user]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setSaveStatus("saving");
    setError("");

    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      /*
      await apiService.put('/user/settings', settings);
      */

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match");
      return;
    }

    if (passwords.new.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setSaveStatus("saving");
    setError("");

    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      /*
      await apiService.patch('/user/change-password', {
        oldPassword: passwords.current,
        newPassword: passwords.new
      });
      */

      // Simulate password update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveStatus("saved");
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Failed to update password");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleExportData = () => {
    // Create export data with real user information
    const exportData = {
      user: {
        id: state.user?._id,
        name: state.user?.userName,
        email: state.user?.userEmail,
        role: state.user?.userRole,
        joinedAt: state.user?.userJoiningDate,
        lastLogin: state.user?.userLastLogin,
      },
      profile: {
        bio: state.user?.userBio,
        skills: state.user?.userSkills,
        academicInfo: state.user?.userAcademicInformation,
        socialProfiles: state.user?.userSocialMediaProfiles,
        location: state.user?.userLocation,
      },
      settings: settings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peer-eval-data-${state.user?.userName?.replace(
      /\s+/g,
      "-"
    )}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 ${
        enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
          enabled ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3">
            Settings
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
            Customize your experience and manage your account preferences
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-colors duration-200 w-full sm:w-auto"
        >
          {saveStatus === "saving" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveStatus === "saved" ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
              ? "Saved!"
              : "Save Changes"}
          </span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Manage your notification preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Email Notifications
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onChange={(value) =>
                  handleSettingChange("emailNotifications", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Push Notifications
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Browser push notifications
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.pushNotifications}
                onChange={(value) =>
                  handleSettingChange("pushNotifications", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Assignment Reminders
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Reminders for upcoming assignments
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.assignmentReminders}
                onChange={(value) =>
                  handleSettingChange("assignmentReminders", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Evaluation Deadlines
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Notifications for evaluation deadlines
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.evaluationDeadlines}
                onChange={(value) =>
                  handleSettingChange("evaluationDeadlines", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Weekly Reports
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Weekly progress summaries
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.weeklyReports}
                onChange={(value) =>
                  handleSettingChange("weeklyReports", value)
                }
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Privacy
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Control your privacy settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.profileVisibility}
                onChange={(e) =>
                  handleSettingChange("profileVisibility", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="public">Public</option>
                <option value="peers">Peers Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Show Email Address
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Display email on your profile
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.showEmail}
                onChange={(value) => handleSettingChange("showEmail", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Show Phone Number
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Display phone on your profile
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.showPhone}
                onChange={(value) => handleSettingChange("showPhone", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Allow Peer Contact
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Let peers contact you directly
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.allowPeerContact}
                onChange={(value) =>
                  handleSettingChange("allowPeerContact", value)
                }
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Customize the look and feel
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange("theme", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  handleSettingChange("timezone", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Security
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Manage your account security
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Two-Factor Authentication
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.twoFactorEnabled}
                onChange={(value) =>
                  handleSettingChange("twoFactorEnabled", value)
                }
                disabled={true} // Disabled until backend implementation
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange("sessionTimeout", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="0">Never</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Change Password
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Update your account password
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  handlePasswordChange("current", e.target.value)
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => handlePasswordChange("new", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) => handlePasswordChange("confirm", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handlePasswordUpdate}
            disabled={
              !passwords.current ||
              !passwords.new ||
              !passwords.confirm ||
              saveStatus === "saving"
            }
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            {saveStatus === "saving" ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Data Management
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Export or delete your data
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export My Data</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete your account? This action cannot be undone."
                )
              ) {
                alert(
                  "Account deletion is not implemented yet. Please contact support."
                );
              }
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>

        <div className="mt-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">
                Data Export Notice
              </p>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
                Your exported data includes profile information, settings, and
                account details. Account deletion is permanent and cannot be
                undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;