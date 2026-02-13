# Quick Reference - Authentication & Progress Tracking

## Common Tasks Cheat Sheet

### 1. Check User Role
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user } = useAuth();
console.log(user?.profile.role); // 'student' | 'faculty' | 'admin'
```

### 2. Get User's Subjects
```typescript
import { AuthService } from '@/lib/auth';

const subjects = await AuthService.getUserSubjects(userId);
```

### 3. Update Student Progress
```typescript
import { ProgressService } from '@/services/progressService';

await ProgressService.updateProgress(
  studentId,
  conceptId,
  subjectId,
  {
    understanding_level: 80,
    status: 'in_progress',
    attempts: 3
  }
);
```

### 4. Start/End Learning Session
```typescript
// Start
const session = await ProgressService.startSession(
  studentId,
  subjectId,
  conceptId
);

// End
await ProgressService.endSession(session.id, {
  engagement_score: 90,
  comprehension_score: 85,
  questions_asked: 7
});
```

### 5. Get Student Progress (Faculty View)
```typescript
const progress = await ProgressService.getSubjectProgress(
  studentId,
  subjectId
);
```

### 6. Get Class Analytics
```typescript
const analytics = await ProgressService.getClassAnalytics(subjectId);
// { totalStudents, avgUnderstanding, statusCounts }
```

### 7. Check Subject Access
```typescript
const hasAccess = await AuthService.hasSubjectAccess(userId, subjectId);
```

### 8. Sign Out
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signOut } = useAuth();
await signOut();
```

## Database Quick Queries

### Get All Students in a Subject
```sql
SELECT s.student_id, p.full_name, p.email
FROM student_enrollments se
JOIN students s ON s.id = se.student_id
JOIN profiles p ON p.id = s.user_id
WHERE se.subject_id = 'your-subject-id';
```

### Get Faculty Teaching a Subject
```sql
SELECT f.faculty_id, p.full_name, f.designation
FROM faculty_subjects fs
JOIN faculty f ON f.id = fs.faculty_id
JOIN profiles p ON p.id = f.user_id
WHERE fs.subject_id = 'your-subject-id';
```

### Get Student's Overall Progress
```sql
SELECT 
  c.concept_name,
  sp.understanding_level,
  sp.status,
  sp.time_spent_minutes
FROM student_progress sp
JOIN concepts c ON c.id = sp.concept_id
WHERE sp.student_id = 'student-id'
AND sp.subject_id = 'subject-id'
ORDER BY c.order_index;
```

### Get Top Performing Students
```sql
SELECT 
  s.student_id,
  p.full_name,
  AVG(sp.understanding_level) as avg_progress,
  COUNT(CASE WHEN sp.status = 'mastered' THEN 1 END) as mastered_count
FROM student_progress sp
JOIN students s ON s.id = sp.student_id
JOIN profiles p ON p.id = s.user_id
WHERE sp.subject_id = 'subject-id'
GROUP BY s.student_id, p.full_name
ORDER BY avg_progress DESC
LIMIT 10;
```

## Component Integration Examples

### Protecting a Route
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <YourComponent />
    </ProtectedRoute>
  );
}
```

### Using Auth in Components
```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div>
      <h1>Welcome {user.profile.full_name}</h1>
      {user.profile.role === 'student' && (
        <p>Student ID: {user.student?.student_id}</p>
      )}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Updating Progress During Chat
```tsx
// In your chat component
import { ProgressService } from '@/services/progressService';

const handleMessageSent = async (conceptId: string) => {
  if (user?.student?.id && selectedSubject) {
    // Increment time and attempts
    await ProgressService.updateProgress(
      user.student.id,
      conceptId,
      selectedSubject,
      {
        attempts: (currentAttempts || 0) + 1,
        time_spent_minutes: (currentTime || 0) + 5,
        last_interaction: new Date().toISOString()
      }
    );
  }
};
```

## API Endpoints Reference

If you add these to your API:

```typescript
// POST /api/progress/update
{
  "studentId": "uuid",
  "conceptId": "uuid",
  "subjectId": "uuid",
  "understanding_level": 75,
  "status": "in_progress"
}

// GET /api/progress/student/:studentId/subject/:subjectId
// Returns all progress for that student in that subject

// GET /api/progress/analytics/:subjectId
// Returns class-wide analytics

// POST /api/progress/session/start
{
  "studentId": "uuid",
  "subjectId": "uuid",
  "conceptId": "uuid"
}

// POST /api/progress/session/end
{
  "sessionId": "uuid",
  "engagement_score": 85,
  "comprehension_score": 78
}
```

## Environment Variables Checklist

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional (for AI agents)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## Common Error Messages

**"User not found"**
- User hasn't completed signup
- Check auth.users table

**"Access denied"**
- User not enrolled in subject (student)
- User not assigned to teach subject (faculty)
- Check RLS policies

**"Invalid role"**
- Role not set correctly in user metadata
- Check profiles.role column

**"Progress update failed"**
- Student not enrolled in subject
- Concept doesn't belong to subject
- Check foreign key relationships
