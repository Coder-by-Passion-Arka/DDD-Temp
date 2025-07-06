import React, { useState } from 'react';
import { X, Plus, Check, Code, Sparkles } from 'lucide-react';

interface SkillSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedSkills: string[];
  assignmentTitle: string;
  onAddSkills: (skills: string[]) => void;
}

const SkillSuggestionModal: React.FC<SkillSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestedSkills,
  assignmentTitle,
  onAddSkills
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddSelected = () => {
    onAddSkills(selectedSkills);
    setSelectedSkills([]);
    onClose();
  };

  const handleSkipAll = () => {
    setSelectedSkills([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-500 to-emerald-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Skills Detected!</h2>
              <p className="text-sm text-white/80">Add to your profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Based on your assignment: <span className="font-semibold text-gray-900 dark:text-white">"{assignmentTitle}"</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We detected these skills. Select which ones to add to your profile:
            </p>
          </div>

          {/* Skills List */}
          <div className="space-y-2 mb-6">
            {suggestedSkills.map((skill, index) => (
              <div
                key={index}
                onClick={() => handleSkillToggle(skill)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedSkills.includes(skill)
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedSkills.includes(skill)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Code className="w-4 h-4" />
                  </div>
                  <span className={`font-medium ${
                    selectedSkills.includes(skill)
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {skill}
                  </span>
                </div>
                
                {selectedSkills.includes(skill) && (
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              ))
            }
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSkipAll}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Skip All
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedSkills.length === 0}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add {selectedSkills.length > 0 ? `${selectedSkills.length} ` : ''}Skills</span>
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Adding skills to your profile helps peers understand your expertise and can improve collaboration opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSuggestionModal;