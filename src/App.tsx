import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DevMailbox } from './components/DevMailbox'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { NAV_ITEMS, PUBLISH_ITEM } from './layouts/navigation'
import { ApplicationsPage } from './pages/app/ApplicationsPage'
import { ComingSoonPage } from './pages/app/ComingSoonPage'
import { HomePage } from './pages/app/HomePage'
import { ContributionsPage } from './pages/app/ContributionsPage'
import { EmailPreferencesPage } from './pages/app/EmailPreferencesPage'
import { ExplorePage } from './pages/app/ExplorePage'
import { ProfilePage } from './pages/app/ProfilePage'
import { ProjectDetailPage } from './pages/app/ProjectDetailPage'
import { ReceivedApplicationsPage } from './pages/app/ReceivedApplicationsPage'
import { CategoriesPage } from './pages/admin/CategoriesPage'
import { ReportsModerationPage } from './pages/admin/ReportsModerationPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './routes/guards'

const upcoming = [...NAV_ITEMS.filter((i) => i.sprint), PUBLISH_ITEM]

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/registro" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/recuperar" element={<ForgotPasswordPage />} />
      <Route path="/restablecer/:token" element={<ResetPasswordPage />} />
      <Route path="/verificar/:token" element={<VerifyEmailPage />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="perfil/:id" element={<ProfilePage />} />
        <Route path="contribuciones" element={<ContributionsPage />} />
        <Route path="notificaciones/correo" element={<EmailPreferencesPage />} />
        <Route path="postulaciones" element={<ApplicationsPage />} />
        <Route path="explorar" element={<ExplorePage />} />
        <Route path="proyecto/:id" element={<ProjectDetailPage />} />
        <Route path="proyecto/:id/postulaciones" element={<ReceivedApplicationsPage />} />
        <Route path="categorias" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
        {upcoming.map((item) => (
          <Route key={item.to} path={item.to.replace('/app/', '')} element={<ComingSoonPage item={item} />} />
        ))}
      </Route>
      <Route path="/admin" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="reports" element={<AdminRoute><ReportsModerationPage /></AdminRoute>} />
        <Route path="categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        {import.meta.env.DEV && <DevMailbox />}
      </AuthProvider>
    </BrowserRouter>
  )
}
