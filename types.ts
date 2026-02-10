export enum UserRole {
  STUDENT = 'Student',
  FACULTY = 'Faculty/Admin',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
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