import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage'
import { ChatPage } from './pages/ChatPage'
import { AboutPage } from './pages/AboutPage'
import { AgentBuilderPage } from './pages/AgentBuilderPage'
import { LandingPage } from './pages/LandingPage'
import { ComicPage } from './pages/ComicPage'
import { GalleryPage } from './pages/GalleryPage'
import { TypeWriterPage } from './pages/TypeWriterPage'
import { TranslationPage } from './pages/TranslationPage'
import { SpeechPage } from './pages/SpeechPage'
import { RealtimePage } from './pages/RealtimePage'
import { QuizPage } from './pages/QuizPage'
import { AdminPage } from './pages/AdminPage'
import { UserProvider, useUser } from './contexts/UserContext'
import { IdeaProvider } from './contexts/IdeaContext'
import { IdeasListPage } from './pages/IdeasListPage'
import { NavVisibilityProvider } from './contexts/NavVisibilityContext'
import './App.css'

function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LandingPage />} />
      <Route path="/" element={<RequireUser><Layout /></RequireUser>}>
        <Route index element={<HomePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="agent" element={<AgentBuilderPage />} />
        <Route path="comic" element={<ComicPage />} />
        <Route path="typewriter" element={<TypeWriterPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="translation" element={<TranslationPage />} />
        <Route path="speech" element={<SpeechPage />} />
        <Route path="realtime" element={<RealtimePage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="ideas" element={<IdeasListPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <IdeaProvider>
          <NavVisibilityProvider>
            <AppRoutes />
          </NavVisibilityProvider>
        </IdeaProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
