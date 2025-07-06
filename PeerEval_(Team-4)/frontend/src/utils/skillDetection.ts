// Skill detection utility for automatic skill suggestions
export interface SkillMapping {
  keywords: string[];
  skill: string;
  category: 'programming' | 'framework' | 'tool' | 'concept' | 'language';
}

export const skillMappings: SkillMapping[] = [
  // Programming Languages
  { keywords: ['javascript', 'js', 'node', 'nodejs'], skill: 'JavaScript', category: 'programming' },
  { keywords: ['typescript', 'ts'], skill: 'TypeScript', category: 'programming' },
  { keywords: ['python', 'py', 'django', 'flask'], skill: 'Python', category: 'programming' },
  { keywords: ['java', 'spring', 'springboot'], skill: 'Java', category: 'programming' },
  { keywords: ['cpp', 'c++', 'cplusplus'], skill: 'C++', category: 'programming' },
  { keywords: ['csharp', 'c#', '.net'], skill: 'C#', category: 'programming' },
  { keywords: ['php', 'laravel', 'symfony'], skill: 'PHP', category: 'programming' },
  { keywords: ['ruby', 'rails'], skill: 'Ruby', category: 'programming' },
  { keywords: ['go', 'golang'], skill: 'Go', category: 'programming' },
  { keywords: ['rust'], skill: 'Rust', category: 'programming' },
  { keywords: ['swift', 'ios'], skill: 'Swift', category: 'programming' },
  { keywords: ['kotlin', 'android'], skill: 'Kotlin', category: 'programming' },

  // Frontend Frameworks & Libraries
  { keywords: ['react', 'reactjs', 'jsx'], skill: 'React', category: 'framework' },
  { keywords: ['vue', 'vuejs'], skill: 'Vue.js', category: 'framework' },
  { keywords: ['angular', 'angularjs'], skill: 'Angular', category: 'framework' },
  { keywords: ['svelte'], skill: 'Svelte', category: 'framework' },
  { keywords: ['nextjs', 'next.js'], skill: 'Next.js', category: 'framework' },
  { keywords: ['nuxt', 'nuxtjs'], skill: 'Nuxt.js', category: 'framework' },

  // Backend Frameworks
  { keywords: ['express', 'expressjs'], skill: 'Express.js', category: 'framework' },
  { keywords: ['fastapi'], skill: 'FastAPI', category: 'framework' },
  { keywords: ['django'], skill: 'Django', category: 'framework' },
  { keywords: ['flask'], skill: 'Flask', category: 'framework' },
  { keywords: ['spring', 'springboot'], skill: 'Spring Boot', category: 'framework' },

  // Databases
  { keywords: ['mongodb', 'mongo'], skill: 'MongoDB', category: 'tool' },
  { keywords: ['mysql'], skill: 'MySQL', category: 'tool' },
  { keywords: ['postgresql', 'postgres'], skill: 'PostgreSQL', category: 'tool' },
  { keywords: ['redis'], skill: 'Redis', category: 'tool' },
  { keywords: ['sqlite'], skill: 'SQLite', category: 'tool' },
  { keywords: ['firebase'], skill: 'Firebase', category: 'tool' },
  { keywords: ['supabase'], skill: 'Supabase', category: 'tool' },

  // Web Technologies
  { keywords: ['html', 'html5'], skill: 'HTML', category: 'language' },
  { keywords: ['css', 'css3'], skill: 'CSS', category: 'language' },
  { keywords: ['sass', 'scss'], skill: 'Sass', category: 'tool' },
  { keywords: ['tailwind', 'tailwindcss'], skill: 'Tailwind CSS', category: 'framework' },
  { keywords: ['bootstrap'], skill: 'Bootstrap', category: 'framework' },

  // Tools & Technologies
  { keywords: ['git', 'github', 'gitlab'], skill: 'Git', category: 'tool' },
  { keywords: ['docker'], skill: 'Docker', category: 'tool' },
  { keywords: ['kubernetes', 'k8s'], skill: 'Kubernetes', category: 'tool' },
  { keywords: ['aws', 'amazon web services'], skill: 'AWS', category: 'tool' },
  { keywords: ['azure'], skill: 'Azure', category: 'tool' },
  { keywords: ['gcp', 'google cloud'], skill: 'Google Cloud', category: 'tool' },
  { keywords: ['webpack'], skill: 'Webpack', category: 'tool' },
  { keywords: ['vite'], skill: 'Vite', category: 'tool' },
  { keywords: ['jest'], skill: 'Jest', category: 'tool' },
  { keywords: ['cypress'], skill: 'Cypress', category: 'tool' },

  // Concepts & Methodologies
  { keywords: ['api', 'rest', 'restful'], skill: 'REST API', category: 'concept' },
  { keywords: ['graphql'], skill: 'GraphQL', category: 'concept' },
  { keywords: ['microservices'], skill: 'Microservices', category: 'concept' },
  { keywords: ['devops'], skill: 'DevOps', category: 'concept' },
  { keywords: ['agile', 'scrum'], skill: 'Agile Development', category: 'concept' },
  { keywords: ['tdd', 'test driven'], skill: 'Test-Driven Development', category: 'concept' },
  { keywords: ['ci/cd', 'continuous integration'], skill: 'CI/CD', category: 'concept' },
  { keywords: ['machine learning', 'ml'], skill: 'Machine Learning', category: 'concept' },
  { keywords: ['artificial intelligence', 'ai'], skill: 'Artificial Intelligence', category: 'concept' },
  { keywords: ['data science'], skill: 'Data Science', category: 'concept' },
  { keywords: ['blockchain'], skill: 'Blockchain', category: 'concept' },
  { keywords: ['cybersecurity', 'security'], skill: 'Cybersecurity', category: 'concept' },
];

export function detectSkillsFromText(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const detectedSkills = new Set<string>();

  skillMappings.forEach(mapping => {
    const hasKeyword = mapping.keywords.some(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      detectedSkills.add(mapping.skill);
    }
  });

  return Array.from(detectedSkills);
}

export function detectSkillsFromAssignment(
  title: string, 
  description?: string, 
  tags?: string[]
): string[] {
  const combinedText = [
    title,
    description || '',
    ...(tags || [])
  ].join(' ');

  return detectSkillsFromText(combinedText);
}

// Simulate assignment completion and skill detection
export function simulateAssignmentCompletion(assignmentData: {
  title: string;
  description?: string;
  tags?: string[];
  userSkills: string[];
}): {
  suggestedSkills: string[];
  newSkills: string[];
} {
  const detectedSkills = detectSkillsFromAssignment(
    assignmentData.title,
    assignmentData.description,
    assignmentData.tags
  );

  // Filter out skills user already has
  const newSkills = detectedSkills.filter(
    skill => !assignmentData.userSkills.includes(skill)
  );

  return {
    suggestedSkills: detectedSkills,
    newSkills
  };
}