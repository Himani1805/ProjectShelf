import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import PublicLayout from './components/layouts/PublicLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PortfolioPage from './pages/public/PortfolioPage';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import CaseStudyDetailPage from './pages/public/CaseStudyDetailPage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import ViewProjectPage from './pages/public/ViewProjectPage';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import CreateProjectPage from './pages/dashboard/CreateProjectPage';
import EditProjectPage from './pages/dashboard/EditProjectPage';
import CaseStudiesPage from './pages/dashboard/CaseStudiesPage';
import CreateCaseStudyPage from './pages/dashboard/CreateCaseStudyPage';
import EditCaseStudyPage from './pages/dashboard/EditCaseStudyPage';
import MediaLibraryPage from './pages/dashboard/MediaLibraryPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import CollaborationsPage from './pages/dashboard/CollaborationsPage';
import TagsPage from './pages/dashboard/TagsPage';
import ChatbotPage from './pages/dashboard/ChatbotPage';
import ViewCaseStudyPage from './pages/public/ViewCaseStudyPage';
import CommentsPage from './pages/dashboard/CommentsPage';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route element={<PublicLayout />}>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/search" element={<SearchResultsPage />} />
                                <Route path="/:username" element={<PortfolioPage />} />
                                <Route path="/:username/project/:projectId" element={<ProjectDetailPage />} />
                                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                                <Route path="/:username/case-study/:caseStudyId" element={<CaseStudyDetailPage />} />
                            </Route>

                            {/* Auth Routes */}
                            <Route element={<PublicRoute />}>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                            </Route>

                            {/* Dashboard Routes */}
                            <Route element={<PrivateRoute />}>
                                <Route element={<DashboardLayout />}>
                                    <Route path="/dashboard" element={<DashboardHome />} />
                                    <Route path="/dashboard/projects" element={<ProjectsPage />} />
                                    <Route path="/dashboard/projects/create" element={<CreateProjectPage />} />
                                    <Route path="/dashboard/projects/edit/:id" element={<EditProjectPage />} />
                                    <Route path="/dashboard/projects/:id" element={<ViewProjectPage />} />
                                    <Route path="/dashboard/case-studies" element={<CaseStudiesPage />} />
                                    <Route path="/dashboard/case-studies/create" element={<CreateCaseStudyPage />} />
                                    <Route path="/dashboard/case-studies/edit/:id" element={<EditCaseStudyPage />} />
                                    <Route path="/dashboard/case-studies/:id" element={<ViewCaseStudyPage />} />
                                    <Route path="/dashboard/media" element={<MediaLibraryPage />} />
                                    <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
                                    <Route path="/dashboard/notifications" element={<NotificationsPage />} />
                                    <Route path="/dashboard/settings" element={<SettingsPage />} />
                                    <Route path="/dashboard/profile" element={<ProfilePage />} />
                                    <Route path="/dashboard/collaborations" element={<CollaborationsPage />} />
                                    <Route path="/dashboard/tags" element={<TagsPage />} />
                                    <Route path="/dashboard/ai-assistant" element={<ChatbotPage />} />
                                    <Route path="/dashboard/comments" element={<CommentsPage />} />
                                </Route>
                            </Route>
                        </Routes>
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;