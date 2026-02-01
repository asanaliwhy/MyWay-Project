import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HomePage } from './pages/HomePage'
import { OrgSelectorPage } from './pages/OrgSelectorPage'
import { OrgCoursesPage } from './pages/OrgCoursesPage'
import { CoursePage } from './pages/CoursePage'

import { PlaceholderPage } from './pages/PlaceholderPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { TeamPage } from './pages/TeamPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { StudyPage } from './pages/learning/StudyPage'
import { ThemeProvider } from './context/ThemeContext'
import { StudyPackProvider } from './context/StudyPackContext'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudyPackProvider>
          <BrowserRouter>
            <Routes>
              {/* All routes are now public - no authentication required */}
              <Route path="/" element={<HomePage />} />
              <Route path="/organizations" element={<OrgSelectorPage />} />
              <Route path="/organizations/:orgId" element={<OrgCoursesPage />} />
              <Route path="/course/:courseId" element={<CoursePage />} />
              <Route path="/study/:materialId" element={<StudyPage />} />
              <Route path="/items" element={<PlaceholderPage title="Syllabus" />} />
              <Route path="/syllabus" element={<PlaceholderPage title="Syllabus" />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </StudyPackProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
