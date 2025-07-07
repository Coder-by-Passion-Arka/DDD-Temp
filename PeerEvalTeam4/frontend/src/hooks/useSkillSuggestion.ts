import { useState, useCallback } from 'react';
import { simulateAssignmentCompletion } from '../utils/skillDetection';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
}

interface UseSkillSuggestionProps {
  userSkills: string[];
  onSkillsAdded: (skills: string[]) => void;
}

export function useSkillSuggestion({ userSkills, onSkillsAdded }: UseSkillSuggestionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<{
    assignmentTitle: string;
    suggestedSkills: string[];
  } | null>(null);

  const triggerSkillSuggestion = useCallback((assignment: Assignment) => {
    const result = simulateAssignmentCompletion({
      title: assignment.title,
      description: assignment.description,
      tags: assignment.tags,
      userSkills
    });

    if (result.newSkills.length > 0) {
      setCurrentSuggestion({
        assignmentTitle: assignment.title,
        suggestedSkills: result.newSkills
      });
      setIsModalOpen(true);
    }
  }, [userSkills]);

  const handleAddSkills = useCallback((skills: string[]) => {
    onSkillsAdded(skills);
    setIsModalOpen(false);
    setCurrentSuggestion(null);
  }, [onSkillsAdded]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentSuggestion(null);
  }, []);

  return {
    isModalOpen,
    currentSuggestion,
    triggerSkillSuggestion,
    handleAddSkills,
    handleCloseModal
  };
}