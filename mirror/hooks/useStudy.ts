import { useState, useEffect } from 'react';
import { StudySession, StudyReport, StudyRoadmap, UserProfile } from '../models/study.model';
import { geminiService } from '../services/gemini.service';

export function useStudy() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [reports, setReports] = useState<StudyReport[]>([]);
  const [roadmap, setRoadmap] = useState<StudyRoadmap | null>(null);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('thinking-mirror-sessions');
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }

      const storedReports = localStorage.getItem('thinking-mirror-reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }

      const storedRoadmap = localStorage.getItem('thinking-mirror-roadmap');
      if (storedRoadmap) {
        setRoadmap(JSON.parse(storedRoadmap));
      }
    } catch (e: any) {
      console.error('Error loading study data from localStorage:', e);
      setError('Failed to load saved study progress.');
    }
  }, []);

  // Calculate profile metrics
  const averageThinkingScore = sessions.length
    ? Number((sessions.reduce((acc, s) => acc + s.thinkingScore, 0) / sessions.length).toFixed(1))
    : 0;

  const profile: UserProfile = {
    averageThinkingScore,
  };

  const addSession = (session: StudySession) => {
    try {
      const updated = [...sessions, session];
      setSessions(updated);
      localStorage.setItem('thinking-mirror-sessions', JSON.stringify(updated));
    } catch (e: any) {
      console.error('Error adding study session:', e);
      setError('Failed to save study session.');
    }
  };

  const generateMonthlyReport = async (month: string) => {
    if (sessions.length === 0) {
      throw new Error('Cannot generate report: No study sessions available.');
    }

    setIsGeneratingReport(true);
    setError(null);

    try {
      const report = await geminiService.generateMonthlyReport(month, sessions);
      const updatedReports = [...reports, report];
      setReports(updatedReports);
      localStorage.setItem('thinking-mirror-reports', JSON.stringify(updatedReports));
    } catch (e: any) {
      console.error('Error generating report:', e);
      const msg = e.message || 'Failed to generate monthly study report.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateRoadmap = async (
    targetGoal: string,
    weaknesses: string[],
    strengths: string[]
  ) => {
    setIsGeneratingRoadmap(true);
    setError(null);

    try {
      const generatedRoadmap = await geminiService.generateRoadmap(
        targetGoal,
        weaknesses,
        strengths
      );
      setRoadmap(generatedRoadmap);
      localStorage.setItem('thinking-mirror-roadmap', JSON.stringify(generatedRoadmap));
    } catch (e: any) {
      console.error('Error generating roadmap:', e);
      const msg = e.message || 'Failed to generate suggested roadmap.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const toggleRoadmapTask = (phaseId: string, taskId: string) => {
    if (!roadmap) return;

    try {
      const updatedPhases = roadmap.phases.map((phase) => {
        if (phase.id !== phaseId) return phase;

        return {
          ...phase,
          tasks: phase.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return { ...task, isCompleted: !task.isCompleted };
          }),
        };
      });

      const updatedRoadmap = {
        ...roadmap,
        phases: updatedPhases,
      };

      setRoadmap(updatedRoadmap);
      localStorage.setItem('thinking-mirror-roadmap', JSON.stringify(updatedRoadmap));
    } catch (e: any) {
      console.error('Error toggling task:', e);
      setError('Failed to update task completion status.');
    }
  };

  const resetAllData = () => {
    try {
      setSessions([]);
      setReports([]);
      setRoadmap(null);
      setError(null);

      localStorage.removeItem('thinking-mirror-sessions');
      localStorage.removeItem('thinking-mirror-reports');
      localStorage.removeItem('thinking-mirror-roadmap');
    } catch (e: any) {
      console.error('Error resetting local storage data:', e);
      setError('Failed to reset local storage.');
    }
  };

  return {
    sessions,
    reports,
    roadmap,
    profile,
    isGeneratingReport,
    isGeneratingRoadmap,
    error,
    addSession,
    generateMonthlyReport,
    generateRoadmap,
    toggleRoadmapTask,
    resetAllData,
  };
}
