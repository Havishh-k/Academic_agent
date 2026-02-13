# Authentication Setup Guide

## Overview
This guide sets up a complete role-based authentication system for your Antigravity app with:
- Student and Faculty login portals
- Subject-based access control
- Student progress tracking
- Faculty can only view their own subject's student progress

## Step-by-Step Setup

### 1. Run Database Migrations

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run **`auth-setup.sql`** (contains all tables, policies, and functions)
4. Run **`seed-data.sql`** (contains sample subjects and concepts)

### 2. Configure Environment Variables

Update your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Update Your App Layout

Wrap your app with the AuthProvider:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Create Route Pages

**Login Page** (`app/login/page.tsx`):
```tsx
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}
```

**Signup Page** (`app/signup/page.tsx`):
```tsx
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return <SignupForm />;
}
```

**Student Portal** (`app/student/page.tsx`):
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StudentDashboard from '@/components/student/StudentDashboard';

export default function StudentPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}
```

**Faculty Portal** (`app/faculty/page.tsx`):
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import FacultyDashboard from '@/components/faculty/FacultyDashboard';

export default function FacultyPage() {
  return (
    <ProtectedRoute allowedRoles={['faculty']}>
      <FacultyDashboard />
    </ProtectedRoute>
  );
}
```

### 5. Create Test Users

You'll need to create users via Supabase Auth. Here's how:

#### Option A: Using Supabase Dashboard
1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. In "User Metadata" section, add:
   ```json
   {
     "full_name": "John Doe",
     "role": "student"
   }
   ```

#### Option B: Using the Signup Form
Just use your signup page at `/signup`

#### Option C: Programmatically (for testing)
```typescript
import { AuthService } from '@/lib/auth';

// Create a student
await AuthService.signUp(
  'student1@university.edu',
  'password123',
  'John Doe',
  'student',
  {
    studentId: 'STU001',
    department: 'Computer Science',
    year: 1,
    semester: 1
  }
);

// Create a faculty member
await AuthService.signUp(
  'faculty1@university.edu',
  'password123',
  'Dr. Smith',
  'faculty',
  {
    facultyId: 'FAC001',
    department: 'Computer Science',
    designation: 'Assistant Professor'
  }
);
```

### 6. Assign Subjects

After creating users, assign them to subjects:

**For Students:**
```sql
-- Get student and subject IDs first
SELECT s.id as student_id, sub.id as subject_id
FROM students s, subjects sub
WHERE s.student_id = 'STU001' AND sub.subject_code = 'CS101';

-- Enroll student
INSERT INTO student_enrollments (student_id, subject_id, academic_year)
VALUES ('student-uuid-here', 'subject-uuid-here', '2024-2025');
```

**For Faculty:**
```sql
-- Get faculty and subject IDs first
SELECT f.id as faculty_id, sub.id as subject_id
FROM faculty f, subjects sub
WHERE f.faculty_id = 'FAC001' AND sub.subject_code = 'CS101';

-- Assign faculty to teach subject
INSERT INTO faculty_subjects (faculty_id, subject_id, academic_year)
VALUES ('faculty-uuid-here', 'subject-uuid-here', '2024-2025');
```

### 7. How Authentication Works

#### Login Flow:
1. User enters email/password
2. System checks credentials via Supabase Auth
3. System fetches user profile and role (student/faculty)
4. Based on role, redirects to appropriate portal:
   - Students → `/student`
   - Faculty → `/faculty`

#### Role-Based Access:
- **Students** can only see:
  - Their own enrolled subjects
  - Their own progress
  - Their own learning sessions

- **Faculty** can only see:
  - Subjects they teach
  - Progress of students enrolled in THEIR subjects
  - Learning sessions for THEIR subjects

This is enforced via Row Level Security (RLS) policies in the database.

## Testing the System

### Test Student Login:
1. Create a student user (see step 5)
2. Enroll them in subjects (see step 6)
3. Login at `/login`
4. Should redirect to `/student`
5. Can view enrolled subjects and track progress

### Test Faculty Login:
1. Create a faculty user (see step 5)
2. Assign them to teach subjects (see step 6)
3. Login at `/login`
4. Should redirect to `/faculty`
5. Can view student progress for their subjects only

## Key Features

### For Students:
✅ View enrolled subjects
✅ Track learning progress per concept
✅ See understanding levels (0-100%)
✅ Monitor time spent on each concept
✅ View mastered vs in-progress concepts

### For Faculty:
✅ View all subjects they teach
✅ See all enrolled students
✅ Track student progress
✅ View class-wide analytics
✅ **Privacy**: Only see students in THEIR subjects

### Progress Tracking:
```typescript
import { ProgressService } from '@/services/progressService';

// Update student progress
await ProgressService.updateProgress(
  studentId,
  conceptId,
  subjectId,
  {
    understanding_level: 75,
    status: 'in_progress',
    time_spent_minutes: 45
  }
);

// Mark concept as mastered
await ProgressService.markConceptMastered(
  studentId,
  conceptId,
  subjectId
);
```

## Advanced Features

### Track Learning Sessions:
```typescript
// Start session when student begins learning
const session = await ProgressService.startSession(
  studentId,
  subjectId,
  conceptId,
  conversationId
);

// End session and log metrics
await ProgressService.endSession(session.id, {
  engagement_score: 85,
  comprehension_score: 78,
  questions_asked: 5,
  concepts_covered: [conceptId1, conceptId2]
});
```

### Get Analytics:
```typescript
// Class-wide analytics for faculty
const analytics = await ProgressService.getClassAnalytics(subjectId);
// Returns: totalStudents, avgUnderstanding, statusCounts
```

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. Students can ONLY access their own data
3. Faculty can ONLY access data for students in their subjects
4. All policies are enforced at the database level
5. No way to bypass these restrictions from the frontend

## Troubleshooting

### "Access denied" errors:
- Check RLS policies are enabled
- Verify user is enrolled/assigned to subject
- Check user role is correct in profiles table

### User can't see subjects:
- Verify enrollment/assignment in database
- Check `student_enrollments` or `faculty_subjects` tables

### Progress not updating:
- Ensure student is enrolled in the subject
- Check student_id matches in both students and student_progress tables

## Next Steps

1. Integrate progress tracking with your AI agents
2. Add automatic progress updates during conversations
3. Build detailed student profile pages for faculty
4. Add analytics dashboards
5. Implement notifications for faculty when students struggle
6. Add export features for progress reports

## Database Schema Reference

**Main Tables:**
- `profiles` - User profiles with roles
- `students` - Student-specific data
- `faculty` - Faculty-specific data
- `subjects` - Course subjects
- `concepts` - Learning concepts per subject
- `student_progress` - Individual progress tracking
- `learning_sessions` - Session-based tracking
- `student_enrollments` - Student-subject mapping
- `faculty_subjects` - Faculty-subject mapping

**Key Relationships:**
- One student → Many enrollments → Many subjects
- One faculty → Many assignments → Many subjects
- One subject → Many concepts
- One student × One concept = One progress record
