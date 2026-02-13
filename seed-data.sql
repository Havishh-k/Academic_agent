-- ============================================
-- SEED DATA FOR TESTING
-- ============================================

-- Insert sample subjects
INSERT INTO subjects (subject_code, subject_name, department, semester, description) VALUES
('CS101', 'Introduction to Programming', 'Computer Science', 1, 'Basics of programming using Python'),
('CS201', 'Data Structures', 'Computer Science', 2, 'Fundamental data structures and algorithms'),
('CS301', 'Database Management', 'Computer Science', 3, 'Relational databases and SQL'),
('MATH101', 'Calculus I', 'Mathematics', 1, 'Differential and integral calculus'),
('MATH201', 'Linear Algebra', 'Mathematics', 2, 'Vectors, matrices, and linear transformations');

-- Insert concepts for CS101
INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Variables and Data Types',
  'Understanding variables, integers, floats, strings',
  'beginner',
  1
FROM subjects WHERE subject_code = 'CS101';

INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Control Flow',
  'If statements, loops, and conditional logic',
  'beginner',
  2
FROM subjects WHERE subject_code = 'CS101';

INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Functions',
  'Creating and using functions, parameters, return values',
  'intermediate',
  3
FROM subjects WHERE subject_code = 'CS101';

INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Lists and Dictionaries',
  'Working with Python collections',
  'intermediate',
  4
FROM subjects WHERE subject_code = 'CS101';

-- Insert concepts for CS201
INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Arrays and Linked Lists',
  'Linear data structures and their operations',
  'intermediate',
  1
FROM subjects WHERE subject_code = 'CS201';

INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Stacks and Queues',
  'LIFO and FIFO data structures',
  'intermediate',
  2
FROM subjects WHERE subject_code = 'CS201';

INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Trees and Graphs',
  'Hierarchical and network data structures',
  'advanced',
  3
FROM subjects WHERE subject_code = 'CS201';

INSERT INTO concepts (subject_id, concept_name, description, difficulty_level, order_index)
SELECT 
  id,
  'Sorting Algorithms',
  'Bubble sort, merge sort, quick sort',
  'advanced',
  4
FROM subjects WHERE subject_code = 'CS201';

-- NOTE: To create test users, you need to use Supabase Auth UI or API
-- The following shows the structure but won't work directly in SQL

-- Example of how users should be created (via Supabase Auth API):
/*
-- Student 1
Email: student1@university.edu
Password: (set via signup)
Metadata: { "full_name": "John Doe", "role": "student" }

-- Student 2  
Email: student2@university.edu
Password: (set via signup)
Metadata: { "full_name": "Jane Smith", "role": "student" }

-- Faculty 1
Email: faculty1@university.edu
Password: (set via signup)
Metadata: { "full_name": "Dr. Robert Brown", "role": "faculty" }

-- Faculty 2
Email: faculty2@university.edu
Password: (set via signup)
Metadata: { "full_name": "Dr. Sarah Wilson", "role": "faculty" }
*/

-- After users are created via Auth, you can insert student/faculty records
-- Replace the UUIDs below with actual user IDs from auth.users

-- Example student records (use actual user_id from profiles after signup)
/*
INSERT INTO students (user_id, student_id, department, year, semester)
SELECT id, 'STU001', 'Computer Science', 1, 1
FROM profiles WHERE email = 'student1@university.edu';

INSERT INTO students (user_id, student_id, department, year, semester)
SELECT id, 'STU002', 'Computer Science', 1, 1
FROM profiles WHERE email = 'student2@university.edu';
*/

-- Example faculty records
/*
INSERT INTO faculty (user_id, faculty_id, department, designation)
SELECT id, 'FAC001', 'Computer Science', 'Assistant Professor'
FROM profiles WHERE email = 'faculty1@university.edu';

INSERT INTO faculty (user_id, faculty_id, department, designation)
SELECT id, 'FAC002', 'Mathematics', 'Professor'
FROM profiles WHERE email = 'faculty2@university.edu';
*/

-- Example faculty subject assignments
/*
INSERT INTO faculty_subjects (faculty_id, subject_id, academic_year)
SELECT f.id, s.id, '2024-2025'
FROM faculty f, subjects s
WHERE f.faculty_id = 'FAC001' AND s.subject_code IN ('CS101', 'CS201');

INSERT INTO faculty_subjects (faculty_id, subject_id, academic_year)
SELECT f.id, s.id, '2024-2025'
FROM faculty f, subjects s
WHERE f.faculty_id = 'FAC002' AND s.subject_code IN ('MATH101', 'MATH201');
*/

-- Example student enrollments
/*
INSERT INTO student_enrollments (student_id, subject_id, academic_year)
SELECT st.id, su.id, '2024-2025'
FROM students st, subjects su
WHERE st.student_id = 'STU001' AND su.subject_code IN ('CS101', 'MATH101');

INSERT INTO student_enrollments (student_id, subject_id, academic_year)
SELECT st.id, su.id, '2024-2025'
FROM students st, subjects su
WHERE st.student_id = 'STU002' AND su.subject_code IN ('CS201', 'MATH201');
*/
