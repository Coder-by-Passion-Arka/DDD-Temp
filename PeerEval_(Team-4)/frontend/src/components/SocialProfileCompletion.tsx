import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';

enum UserRole {
  TEACHER = "teacher",
  STUDENT = "student",
  ADMIN = "admin",
}

interface SocialProfileCompletionProps {
  onComplete: () => void;
  onCancel: () => void;
}

const SocialProfileCompletion: React.FC<SocialProfileCompletionProps> = ({ onComplete, onCancel }) => {
  const { state, updateProfile } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    userPhoneNumber: "",
    countryCode: "+91",
    userLocation: {
      homeAddress: "",
      currentAddress: "",
    },
    userRole: "student" as UserRole,
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.userPhoneNumber || !formData.userLocation.homeAddress || !formData.userLocation.currentAddress) {
        toast.error("All fields are required");
        setIsLoading(false);
        return;
      }

      // Call API to complete social profile
      await apiService.patch('/auth/social-profile/complete', formData);
      
      toast.success("Profile completed successfully!");
      onComplete();
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error("Failed to complete profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Complete Your Profile</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Welcome! Please provide a few more details to complete your profile.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
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
              className="col-span-2 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
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
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Complete Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialProfileCompletion;