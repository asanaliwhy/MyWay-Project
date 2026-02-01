# MyWay LMS Backend

A comprehensive Learning Management System backend built with Go, featuring multi-tenancy, AI-powered study pack generation, and advanced analytics.

## Features

### 1. Authentication & Security
- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ JWT authentication with access and refresh tokens
- ✅ Logout functionality
- ✅ Role-Based Access Control (RBAC): Student, Teacher, Organizer

### 2. Multi-tenancy
- ✅ Organization-based data isolation
- ✅ Organization membership validation
- ✅ Org switching functionality
- ✅ Data scoped by organization

### 3. Core LMS Features
- ✅ Courses: Create, list, and view courses
- ✅ Modules: Full CRUD operations
- ✅ Assignments: Create assignments with status tracking (Not started, In progress, Submitted, Graded)
- ✅ Discussions: Create threads and replies
- ✅ Progress tracking: Real-time progress percentage per course

### 4. Import System
- ✅ YouTube link import with transcript support
- ✅ Document upload (PDF/DOCX) support
- ✅ Status tracking: QUEUED → PROCESSING → READY/FAILED
- ✅ Import validation

### 5. Study Pack Generation
- ✅ Automatic generation from imported materials
- ✅ Summary generation
- ✅ Quiz generation with questions, answers, and explanations
- ✅ Flashcard generation
- ✅ Async processing with status tracking

### 6. Quiz & Flashcards
- ✅ Take quizzes and submit answers
- ✅ Score calculation and tracking
- ✅ Flashcard sessions (know/don't know)
- ✅ Progress metrics integration

### 7. Analytics Dashboards
- ✅ Student Dashboard: Progress %, quiz trends, weak topics, recommendations
- ✅ Teacher Dashboard: Cohort progress, at-risk students, weakest topics
- ✅ Organizer Dashboard: Active users, study packs generated, quizzes taken, retention metrics

### 8. Reliability
- ✅ Comprehensive error handling
- ✅ Logging for imports and generation jobs
- ✅ Seed data script for demo setup

## Setup

### Prerequisites
- Go 1.23+
- PostgreSQL database
- (Optional) Gemini API key for AI features

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend-go
```

2. Install dependencies:
```bash
go mod download
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
DATABASE_URL=postgres://user:password@localhost:5432/myway?sslmode=disable
JWT_SECRET=your-secret-key-here
PORT=3000
GEMINI_API_KEY=your-gemini-api-key (optional)
GIN_MODE=debug
```

4. Run migrations and seed data:
```bash
# Run the seed script to create demo data
go run cmd/seed/main.go
```

5. Start the server:
```bash
go run cmd/server/main.go
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Organizations
- `POST /organizations` - Create organization
- `GET /organizations` - List user's organizations
- `POST /organizations/:id/switch` - Switch active organization

### Courses
- `POST /courses` - Create course
- `GET /courses/:id` - Get course details
- `GET /courses/org/:orgId` - List courses by organization

### Modules
- `POST /modules` - Create module
- `GET /modules/course/:courseId` - List modules in course
- `GET /modules/:id` - Get module details
- `PUT /modules/:id` - Update module
- `DELETE /modules/:id` - Delete module

### Assignments
- `POST /assignments` - Create assignment
- `GET /assignments/course/:courseId` - List assignments in course
- `GET /assignments/:id` - Get assignment details
- `POST /assignments/:id/submit` - Submit assignment

### Discussions
- `POST /discussions/threads` - Create thread
- `GET /discussions/threads/course/:courseId` - List threads in course
- `GET /discussions/threads/:id` - Get thread details
- `POST /discussions/threads/:threadId/replies` - Create reply

### Flashcards
- `GET /flashcards/studypack/:studyPackId` - Get flashcards for study pack
- `POST /flashcards/sessions` - Record flashcard session
- `GET /flashcards/sessions` - Get user's flashcard sessions

### Progress
- `GET /progress/course/:courseId` - Get course progress
- `GET /progress/org` - Get progress by organization (requires org context)

### Analytics
- `GET /analytics/student` - Student dashboard
- `GET /analytics/teacher` - Teacher dashboard
- `GET /analytics/organizer` - Organizer dashboard (requires ORGANIZER role)
- `POST /analytics/quiz/attempt` - Record quiz attempt

### Imports
- `POST /imports/youtube` - Import YouTube video
- `POST /imports/document` - Import document (PDF/DOCX)
- `GET /imports/status/:materialId` - Get import status

### AI
- `GET /ai/studypack/:materialId` - Get study pack
- `POST /ai/tutor` - AI tutor chat

## Demo Credentials

After running the seed script, you can use these credentials:

- **Student**: `student@example.com` / `student123`
- **Teacher**: `teacher@example.com` / `teacher123`
- **Organizer**: `organizer@example.com` / `organizer123`

## Multi-tenancy Usage

To access organization-scoped resources, include the `X-Org-ID` header in your requests:

```bash
curl -H "Authorization: Bearer <token>" \
     -H "X-Org-ID: <org-id>" \
     http://localhost:3000/courses/org/<org-id>
```

## Status Tracking

Import and study pack generation use the following statuses:
- `QUEUED` - Waiting to be processed
- `PROCESSING` - Currently being processed
- `READY` - Successfully completed
- `FAILED` - Processing failed

## Development

### Running Tests
```bash
go test ./...
```

### Building
```bash
go build -o bin/server cmd/server/main.go
```

## License

[Your License Here]
