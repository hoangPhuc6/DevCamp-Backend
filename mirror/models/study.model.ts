export interface StudySession {
  problemName: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  thinkingScore: number;
  strengths: string[];
  improvements: string[];
}

export interface StudyReport {
  month: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  estimatedHours: number;
  isCompleted: boolean;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  tasks: RoadmapTask[];
}

export interface StudyRoadmap {
  targetGoal: string;
  phases: RoadmapPhase[];
}

export interface UserProfile {
  averageThinkingScore: number;
}
