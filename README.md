<div align="center">

# 🎓 MyWay - AI-Powered Learning Management System

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Go](https://img.shields.io/badge/Go-1.23-00ADD8?logo=go)](https://golang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**An intelligent learning platform that transforms YouTube videos and documents into personalized study materials using Google Gemini AI**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [AI Pipeline](#-ai-pipeline)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🌟 Overview

**MyWay** is a full-stack Learning Management System (LMS) designed to revolutionize how students learn from video content. By leveraging **Google Gemini AI**, the platform automatically generates:

- 📝 **Smart Summaries** - Key concepts extracted from any content
- ❓ **Interactive Quizzes** - Auto-generated multiple-choice questions
- 🃏 **Flashcards** - Spaced repetition cards for memorization
- 📊 **Progress Tracking** - Analytics for students and teachers

### Why MyWay?

Traditional LMS platforms require instructors to manually create quizzes and study materials. MyWay automates this process by:

1. Importing YouTube videos or documents
2. Extracting transcripts automatically (no API key required!)
3. Processing content through Gemini AI
4. Generating comprehensive study packs in seconds

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **YouTube Import** | Paste any YouTube URL and automatically extract transcripts |
| **AI Study Packs** | Generate summaries, quizzes, and flashcards from any content |
| **Interactive Quizzes** | Answer questions with instant feedback and explanations |
| **3D Flashcards** | Beautiful flip animations with Framer Motion |
| **Dark Mode** | Full dark/light theme support |
| **Role-Based Access** | Student, Teacher, and Organizer roles |
| **Multi-Tenancy** | Organizations with isolated data |

### 👤 For Students

- Watch embedded YouTube videos directly in the platform
- Read AI-generated summaries to grasp key concepts
- Test knowledge with adaptive quizzes
- Practice with flashcards for better retention
- Track progress across all courses

### 👨‍🏫 For Teachers

- Create and organize courses with modules
- Import content from YouTube or upload documents
- AI generates study materials automatically
- View student performance analytics
- Manage assignments and discussions

### 🏢 For Organizers

- Manage multiple organizations
- Control user access and permissions
- View platform-wide analytics
- Configure AI generation settings

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework with Hooks |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool & dev server |
| **TailwindCSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **React Router 6** | Client-side routing |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### Backend

| Technology | Purpose |
|------------|---------|
| **Go 1.23** | Backend language |
| **Gin** | HTTP web framework |
| **GORM** | ORM for database |
| **PostgreSQL 15** | Primary database |
| **JWT** | Authentication tokens |
| **Google Gemini AI** | Content generation |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **pgAdmin** | Database management UI |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │  Components │  │   Context   │             │
│  │  - Home     │  │  - Sidebar  │  │  - Auth     │             │
│  │  - Course   │  │  - Accordion│  │  - Theme    │             │
│  │  - Study    │  │  - Quiz     │  │  - StudyPack│             │
│  │  - Analytics│  │  - Flashcard│  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                           │                                     │
│                    Axios HTTP Client                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Go + Gin)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Handlers   │  │  Middleware │  │   Models    │             │
│  │  - Auth     │  │  - CORS     │  │  - User     │             │
│  │  - Courses  │  │  - JWT Auth │  │  - Course   │             │
│  │  - AI       │  │  - RBAC     │  │  - Module   │             │
│  │  - Transcript│ │  - OrgCheck │  │  - Material │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                           │                                     │
│                     GORM (ORM)                                  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│  PostgreSQL Database │    │   Google Gemini AI   │
│  - Users             │    │   - Summarization    │
│  - Organizations     │    │   - Quiz Generation  │
│  - Courses/Modules   │    │   - Flashcard Gen    │
│  - Study Packs       │    │                      │
└──────────────────────┘    └──────────────────────┘
```

### Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant Y as YouTube
    participant G as Gemini AI
    participant D as Database

    U->>F: Import YouTube Video
    F->>B: POST /imports/youtube
    B->>Y: Fetch Video Page (Scrape)
    Y-->>B: HTML with Caption Tracks
    B->>Y: Fetch Caption XML
    Y-->>B: Transcript XML
    B->>B: Parse & Format Transcript
    B->>D: Save Material & StudyPack
    B->>G: Send Transcript for Processing
    G-->>B: Summary, Quiz, Flashcards
    B->>D: Save AI Content
    B-->>F: StudyPack Ready
    F-->>U: Display Study Materials
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Go** 1.23+
- **Docker** and Docker Compose
- **Git**

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/asanaliwhy/MyWay-Project.git
cd MyWay-Project

# 2. Start the database
docker-compose up -d

# 3. Install frontend dependencies
npm install

# 4. Set up backend environment
cd backend-go
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# 5. Start the backend
go run cmd/server/main.go

# 6. Start the frontend (new terminal)
cd ..
npm run dev

# 7. Open http://localhost:5173 in your browser
```

### Manual Setup

#### Database Setup

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Verify containers are running
docker ps
# You should see: myway-postgres (port 5433) and myway-pgadmin (port 5050)
```

#### Backend Setup

```bash
cd backend-go

# Install Go dependencies
go mod download

# Create environment file
cat > .env << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5433/myway_db?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=8081
GEMINI_API_KEY=your-gemini-api-key-here
GIN_MODE=debug
EOF

# Run migrations and start server
go run cmd/server/main.go
```

#### Frontend Setup

```bash
# From project root
npm install
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`backend-go/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWT tokens | ✅ |
| `PORT` | Server port (default: 8081) | ❌ |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ |
| `GIN_MODE` | Gin mode: debug/release | ❌ |

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste into your `.env` file

### Docker Configuration

The `docker-compose.yml` sets up:

```yaml
services:
  db:
    image: postgres:15
    ports: "5433:5432"  # Host:Container
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myway_db

  pgadmin:
    image: dpage/pgadmin4
    ports: "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@myway.edu
      PGADMIN_DEFAULT_PASSWORD: admin
```

Access pgAdmin at `http://localhost:5050` to manage your database.

---

## 📖 Usage Guide

### 1. Create an Account

1. Navigate to `http://localhost:5173`
2. Click "Get Started" or "Sign In"
3. Register with email and password
4. Choose your role (Student/Teacher/Organizer)

### 2. Create an Organization

1. After login, you'll see the Organization Selector
2. Click "Create Organization"
3. Enter organization name and description
4. Invite team members (optional)

### 3. Create a Course

1. Select your organization
2. Click "Create Course"
3. Fill in course details:
   - Title
   - Description
   - Category
   - Thumbnail

### 4. Add Content

1. Open your course
2. Navigate to "Modules" tab
3. Click "Add Material"
4. Choose import type:
   - **YouTube Video**: Paste URL
   - **Document**: Upload PDF/DOCX

### 5. Study with AI Materials

1. Click "Study Lesson" on any material
2. The Study Page shows:
   - Video player (if YouTube)
   - AI-generated transcript
   - Summary tab
   - Quiz tab (interactive)
   - Flashcards tab (3D flip)

### 6. Track Progress

1. Students: View "Analytics" page for personal progress
2. Teachers: See cohort performance
3. Organizers: Platform-wide statistics

---

## 📚 API Reference

### Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe",
  "role": "STUDENT"
}

Response: 201 Created
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

#### Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

### Courses

#### List Courses by Organization
```http
GET /courses/org/:orgId
Authorization: Bearer <token>
```

#### Create Course
```http
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "org_id": "uuid",
  "title": "Python Fundamentals",
  "description": "Learn Python from scratch"
}
```

### Content Import

#### Import YouTube Video
```http
POST /imports/youtube
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "uuid",
  "moduleId": "uuid",
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

#### Get YouTube Transcript (Public)
```http
GET /youtube/transcript?url=https://www.youtube.com/watch?v=VIDEO_ID

Response:
{
  "videoId": "VIDEO_ID",
  "title": "Video Title",
  "transcript": "Full transcript text...",
  "language": "en",
  "duration": 3600
}
```

### AI Study Packs

#### Get Study Pack
```http
GET /ai/studypack/:materialId
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "material": { "title": "...", "videoUrl": "...", "transcript": "..." },
  "summary": { "content": { "bullets": [...], "summary": "..." } },
  "quizzes": [{ "questions": [...] }],
  "flashcards": [{ "front": "...", "back": "..." }]
}
```

### Analytics

#### Submit Quiz Attempt
```http
POST /analytics/quiz/attempt
Authorization: Bearer <token>
Content-Type: application/json

{
  "quizId": "uuid",
  "answers": [
    { "questionId": "q1", "selectedAnswer": "option_a" }
  ],
  "score": 80,
  "timeSpentSeconds": 120
}
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │       │Organizations │       │   Courses    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │──┐    │ name         │◄──────│ org_id (FK)  │
│ password     │  │    │ description  │       │ title        │
│ name         │  │    │ created_at   │       │ description  │
│ role         │  │    └──────────────┘       │ instructor_id│
│ created_at   │  │           │               └──────────────┘
└──────────────┘  │           │                      │
       │          │    ┌──────┴───────┐              │
       │          │    │              │              │
       │          └───►│  OrgMembers  │              │
       │               │  (user_id)   │              │
       │               │  (org_id)    │              │
       │               │  (role)      │              │
       │               └──────────────┘              │
       │                                             │
       │          ┌──────────────┐                   │
       │          │   Modules    │◄──────────────────┘
       │          ├──────────────┤
       │          │ id (PK)      │
       │          │ course_id(FK)│
       │          │ title        │
       │          │ order        │
       │          └──────────────┘
       │                 │
       │                 ▼
       │          ┌──────────────┐       ┌──────────────┐
       │          │  Materials   │──────►│  StudyPacks  │
       │          ├──────────────┤       ├──────────────┤
       │          │ id (PK)      │       │ id (PK)      │
       │          │ module_id(FK)│       │ material_id  │
       │          │ type         │       │ status       │
       │          │ title        │       │ created_by   │
       │          │ source_url   │       │ published_at │
       │          │ transcript   │       └──────────────┘
       │          └──────────────┘              │
       │                                        │
       │          ┌────────────────────────────┬┴──────────────┐
       │          │                            │               │
       │          ▼                            ▼               ▼
       │   ┌──────────────┐            ┌──────────────┐  ┌──────────────┐
       │   │  Summaries   │            │    Quizzes   │  │  Flashcards  │
       │   ├──────────────┤            ├──────────────┤  ├──────────────┤
       │   │ studypack_id │            │ studypack_id │  │ studypack_id │
       │   │ content      │            │ version      │  │ front        │
       │   └──────────────┘            └──────────────┘  │ back         │
       │                                      │          └──────────────┘
       │                                      ▼
       │                               ┌──────────────┐
       └──────────────────────────────►│QuizAttempts  │
                                       ├──────────────┤
                                       │ user_id (FK) │
                                       │ quiz_id (FK) │
                                       │ score        │
                                       │ answers      │
                                       └──────────────┘
```

### Key Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with authentication |
| `organizations` | Multi-tenant organizations |
| `org_members` | User-Organization relationships |
| `courses` | Course containers |
| `modules` | Ordered sections within courses |
| `materials` | Content items (videos, docs) |
| `study_packs` | AI-generated content bundles |
| `summaries` | AI summaries (JSON content) |
| `quizzes` | Quiz containers |
| `quiz_questions` | Individual quiz questions |
| `flashcards` | Study flashcards |
| `quiz_attempts` | Student quiz submissions |

---

## 🤖 AI Pipeline

### How Transcript Extraction Works

MyWay uses a **scraping approach** to extract YouTube transcripts without requiring API keys:

```go
// 1. Fetch video page HTML
resp, _ := http.Get("https://www.youtube.com/watch?v=" + videoID)

// 2. Find caption tracks in embedded JSON
// YouTube includes this in the page source
re := regexp.MustCompile(`"captionTracks":(\[.*?\])`)
matches := re.FindStringSubmatch(html)

// 3. Parse available languages, prefer English
for _, track := range tracks {
    if strings.HasPrefix(track.LanguageCode, "en") {
        captionURL = track.BaseURL
        break
    }
}

// 4. Fetch XML captions from YouTube's servers
resp, _ := http.Get(captionURL)

// 5. Parse XML and format with timestamps
// <text start="0" dur="5">Hello World</text>
// → "0:00 - Hello World"
```

### AI Content Generation

The system uses **Google Gemini 3 Flash** for fast, affordable generation:

```go
// Summary Generation Prompt
prompt := `Analyze this educational transcript and create:
1. A 2-3 paragraph comprehensive summary
2. 5-7 key bullet points of main concepts

Transcript:
` + transcript

// Quiz Generation Prompt  
prompt := `Create 5 multiple-choice questions from this content.
Each question should have:
- Clear question prompt
- 4 answer options
- Correct answer
- Brief explanation

Content:
` + transcript

// Flashcard Generation Prompt
prompt := `Create 10 flashcards for studying this content.
Format as JSON:
[
  {"front": "Term or Question", "back": "Definition or Answer"}
]

Content:
` + transcript
```

### Processing Pipeline

```
YouTube URL
    │
    ▼
┌─────────────────┐
│ Video ID Extract│  "youtube.com/watch?v=ABC123" → "ABC123"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Scrape Captions │  Fetch HTML → Find captionTracks JSON → Get XML URL
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse Transcript│  XML → Formatted text with timestamps
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Summary  │  "Summarize this content..."
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Quiz     │  "Create 5 MCQ questions..."
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Gemini Flashcards│  "Create 10 flashcards..."
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │  StudyPack status: READY
└─────────────────┘
```

---

## 📁 Project Structure

```
MyWay-Project/
├── 📁 backend-go/                 # Go Backend
│   ├── 📁 cmd/
│   │   └── 📁 server/
│   │       └── main.go           # Entry point
│   ├── 📁 internal/
│   │   ├── 📁 config/            # Environment configuration
│   │   ├── 📁 database/          # GORM connection & migrations
│   │   ├── 📁 handlers/          # HTTP handlers
│   │   │   ├── auth.go           # Authentication endpoints
│   │   │   ├── courses.go        # Course CRUD
│   │   │   ├── ai.go             # Gemini AI integration
│   │   │   ├── imports.go        # YouTube/Document import
│   │   │   ├── transcript.go     # YouTube transcript scraper
│   │   │   └── analytics.go      # Progress tracking
│   │   ├── 📁 middleware/        # Auth, CORS, RBAC
│   │   └── 📁 models/            # GORM models
│   ├── .env                      # Environment variables
│   ├── go.mod                    # Go dependencies
│   └── go.sum
│
├── 📁 features/                   # Frontend Feature Modules
│   ├── 📁 auth/
│   │   ├── 📁 components/        # SignIn, SignUp, ProtectedRoute
│   │   └── 📁 context/           # AuthContext (user state)
│   ├── 📁 course/
│   │   └── 📁 components/        # ModuleAccordion, MaterialCard
│   ├── 📁 ai-tutor/
│   │   ├── 📁 api/               # StudyPackService
│   │   ├── 📁 components/        # QuizInteraction, Flashcards
│   │   └── 📁 context/           # StudyPackContext
│   ├── 📁 organization/
│   │   └── 📁 components/        # OrgSidebar, OrgTopBar
│   └── 📁 notifications/
│
├── 📁 pages/                      # Route Pages
│   ├── HomePage.tsx              # Landing page
│   ├── CoursePage.tsx            # Course details + modules
│   ├── 📁 learning/
│   │   └── StudyPage.tsx         # Video player + AI materials
│   ├── AnalyticsPage.tsx         # Student/Teacher dashboards
│   ├── OrgSelectorPage.tsx       # Organization switcher
│   └── OrgCoursesPage.tsx        # Org course list
│
├── 📁 context/                    # Global React Contexts
│   └── ThemeContext.tsx          # Dark/Light mode
│
├── 📁 lib/                        # Utilities
│   └── axios-client.ts           # Configured Axios instance
│
├── App.tsx                       # Main React app + routing
├── index.tsx                     # React entry point
├── index.css                     # Global styles + Tailwind
├── tailwind.config.js            # Tailwind configuration
├── vite.config.ts                # Vite configuration
├── docker-compose.yml            # Database containers
├── package.json                  # NPM dependencies
└── README.md                     # This file
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests (if available)
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: `gofmt` + `golint`
- Use meaningful commit messages
- Add comments for complex logic

### Areas for Contribution

- [ ] Unit tests for frontend components
- [ ] Integration tests for API endpoints
- [ ] Support for more content types (Vimeo, PDFs)
- [ ] Real-time collaboration features
- [ ] Mobile responsive improvements
- [ ] Internationalization (i18n)
- [ ] Accessibility (a11y) improvements

---

## 🔧 Troubleshooting

### Database Connection Failed

```
Error: dial tcp 127.0.0.1:5433: connectex: connection refused
```

**Solution**: Start Docker containers:
```bash
docker-compose up -d
docker ps  # Verify myway-postgres is running
```

### YouTube Transcript Not Loading

```
Error: net::ERR_CONNECTION_REFUSED
```

**Solutions**:
1. Ensure Go backend is running on port 8081
2. Check that `StudyPackService.ts` uses `localhost:8081`
3. Verify the video has captions enabled

### AI Generation Fails

```
Error: Failed to generate study pack
```

**Solutions**:
1. Check `GEMINI_API_KEY` in `.env`
2. Verify API key is valid at [Google AI Studio](https://aistudio.google.com/)
3. Check API quota limits

### Port Already in Use

```
Error: listen tcp :8081: bind: address already in use
```

**Solution**: Kill the existing process:
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8081
kill -9 <PID>
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Asanali** - *Initial work* - [@asanaliwhy](https://github.com/asanaliwhy)

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering content generation
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [kkdai/youtube](https://github.com/kkdai/youtube) for YouTube integration inspiration

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for learners everywhere

</div>
