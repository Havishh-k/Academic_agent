export enum UserRole {
  STUDENT = 'Student',
  FACULTY = 'Faculty',
  ADMIN = 'Admin',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  agentSteps?: AgentStep[];
  retrievedSources?: { source: string; similarity: number }[];
}

export interface AgentStep {
  agent: 'proctor' | 'curator' | 'tutor' | 'intent_classifier' | 'rag_retriever' | 'socratic_engine';
  status: string;
  reason?: string | null;
  sources?: string[];
}

export interface CourseDocument {
  id: string;
  title: string;
  content: string;
}

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
};

export interface CurriculumTopic {
  id: string;
  title: string;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  topics: CurriculumTopic[];
}

export interface StudentProgress {
  completedTopicIds: string[];
}

export interface StudentProgressEntry {
  id: string;
  student_id: string;
  course_id: string;
  topic_id: string;
  mastery_level: number;
  interaction_count: number;
  last_struggled_at: string | null;
  last_interaction_at: string;
}