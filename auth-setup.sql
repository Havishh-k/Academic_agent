# Authentication & Role-Based Access Control Setup

## Database Schema for Auth & Roles

Run this SQL in your Supabase SQL Editor:

```sql
-- ============================================
-- 1. USER PROFILES & ROLES
-- ============================================

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Student-specific data
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  student_id TEXT UNIQUE NOT NULL, -- e.g., "STU001"
  department TEXT,
  year INTEGER,
  semester INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Faculty-specific data
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  faculty_id TEXT UNIQUE NOT NULL, -- e.g., "FAC001"
  department TEXT,
  designation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 2. SUBJECTS & ENROLLMENTS
-- ============================================

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_code TEXT UNIQUE NOT NULL,
  subject_name TEXT NOT NULL,
  department TEXT,
  semester INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Faculty teaching subjects (many-to-many)
CREATE TABLE faculty_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year TEXT, -- e.g., "2024-2025"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(faculty_id, subject_id, academic_year)
);

-- Student enrollments (many-to-many)
CREATE TABLE student_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, subject_id, academic_year)
);

-- ============================================
-- 3. LEARNING CONCEPTS & PROGRESS TRACKING
-- ============================================

-- Concepts/Topics for each subject
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  concept_name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  order_index INTEGER, -- for ordering concepts
  parent_concept_id UUID REFERENCES concepts(id), -- for nested concepts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Student progress on concepts
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Progress metrics
  understanding_level INTEGER CHECK (understanding_level BETWEEN 0 AND 100), -- 0-100%
  time_spent_minutes INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE,
  
  -- Status tracking
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'mastered'
  notes TEXT, -- Student's own notes
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  UNIQUE(student_id, concept_id)
);

-- Agent interactions with progress tracking
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES concepts(id),
  conversation_id UUID REFERENCES conversations(id),
  
  -- Session data
  session_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  
  -- AI assessment
  engagement_score INTEGER CHECK (engagement_score BETWEEN 0 AND 100),
  comprehension_score INTEGER CHECK (comprehension_score BETWEEN 0 AND 100),
  questions_asked INTEGER DEFAULT 0,
  concepts_covered TEXT[], -- Array of concept IDs
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 4. UPDATE EXISTING TABLES FOR MULTI-TENANCY
-- ============================================

-- Add user_id to agents table
ALTER TABLE agents ADD COLUMN created_by UUID REFERENCES profiles(id);
ALTER TABLE agents ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Add user and subject context to conversations
ALTER TABLE conversations 
  ADD COLUMN user_id UUID REFERENCES profiles(id),
  ADD COLUMN subject_id UUID REFERENCES subjects(id),
  ADD COLUMN student_id UUID REFERENCES students(id);

-- Add subject context to messages
ALTER TABLE messages 
  ADD COLUMN subject_id UUID REFERENCES subjects(id),
  ADD COLUMN concept_id UUID REFERENCES concepts(id);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_student_progress_student ON student_progress(student_id);
CREATE INDEX idx_student_progress_concept ON student_progress(concept_id);
CREATE INDEX idx_student_progress_subject ON student_progress(subject_id);
CREATE INDEX idx_learning_sessions_student ON learning_sessions(student_id);
CREATE INDEX idx_learning_sessions_subject ON learning_sessions(subject_id);
CREATE INDEX idx_faculty_subjects_faculty ON faculty_subjects(faculty_id);
CREATE INDEX idx_faculty_subjects_subject ON faculty_subjects(subject_id);
CREATE INDEX idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_subject ON student_enrollments(subject_id);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- STUDENTS POLICIES
CREATE POLICY "Students can view their own data"
  ON students FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Faculty can view students in their subjects"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM faculty f
      JOIN faculty_subjects fs ON f.id = fs.faculty_id
      JOIN student_enrollments se ON fs.subject_id = se.subject_id
      WHERE f.user_id = auth.uid() AND se.student_id = students.id
    )
  );

-- FACULTY POLICIES
CREATE POLICY "Faculty can view their own data"
  ON faculty FOR SELECT
  USING (user_id = auth.uid());

-- SUBJECTS POLICIES
CREATE POLICY "Everyone can view subjects"
  ON subjects FOR SELECT
  USING (true);

-- STUDENT PROGRESS POLICIES
CREATE POLICY "Students can view their own progress"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE students.id = student_progress.student_id 
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own progress"
  ON student_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students WHERE students.id = student_progress.student_id 
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can modify their own progress"
  ON student_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE students.id = student_progress.student_id 
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can view progress of their students"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM faculty f
      JOIN faculty_subjects fs ON f.id = fs.faculty_id
      WHERE f.user_id = auth.uid() 
      AND fs.subject_id = student_progress.subject_id
    )
  );

-- LEARNING SESSIONS POLICIES
CREATE POLICY "Students can view their own sessions"
  ON learning_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE students.id = learning_sessions.student_id 
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can view sessions for their subjects"
  ON learning_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM faculty f
      JOIN faculty_subjects fs ON f.id = fs.faculty_id
      WHERE f.user_id = auth.uid() 
      AND fs.subject_id = learning_sessions.subject_id
    )
  );

-- CONVERSATIONS POLICIES
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Faculty can view conversations in their subjects"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM faculty f
      JOIN faculty_subjects fs ON f.id = fs.faculty_id
      WHERE f.user_id = auth.uid() 
      AND fs.subject_id = conversations.subject_id
    )
  );

-- MESSAGES POLICIES
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can view messages in their subject conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM faculty f
      JOIN faculty_subjects fs ON f.id = fs.faculty_id
      JOIN conversations c ON c.id = messages.conversation_id
      WHERE f.user_id = auth.uid() 
      AND fs.subject_id = c.subject_id
    )
  );

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    (NEW.raw_user_meta_data->>'role')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if faculty teaches subject
CREATE OR REPLACE FUNCTION faculty_teaches_subject(
  faculty_user_id UUID,
  check_subject_id UUID
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM faculty f
    JOIN faculty_subjects fs ON f.id = fs.faculty_id
    WHERE f.user_id = faculty_user_id 
    AND fs.subject_id = check_subject_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if student is enrolled in subject
CREATE OR REPLACE FUNCTION student_enrolled_in_subject(
  student_user_id UUID,
  check_subject_id UUID
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    JOIN student_enrollments se ON s.id = se.student_id
    WHERE s.user_id = student_user_id 
    AND se.subject_id = check_subject_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```
