import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouteMetadata from "./components/RouteMetadata";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import AddQuestionPage from "./pages/AddQuestionPage";
import ManageQuestionsPage from "./pages/ManageQuestionsPage";
import SubjectTestPage from "./pages/SubjectTestPage";
import SubjectRequestPage from "./pages/SubjectRequestPage";
import TopicSelectionPage from "./pages/TopicSelectionPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminQuestionReportsPage from "./pages/AdminQuestionReportsPage";
import MistakesPage from "./pages/MistakesPage";
import EmailPreferencesPage from "./pages/EmailPreferencesPage";
import AdminDigestPage from "./pages/AdminDigestPage";
import AdminRequestsPage from "./pages/AdminRequestdPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminNotifyUsersPage from "./pages/AdminNotifyUsersPage";
import UserLoginPage from "./pages/UserLoginPage";
import UserSignupPage from "./pages/UserSignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import NotFoundPage from "./pages/NotFoundPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import NetworkErrorPage from "./pages/NetworkErrorPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AboutPage from "./pages/AboutPage";
import QuickReviewListPage from "./pages/QuickReviewListPage";
import QuickReviewDetailPage from "./pages/QuickReviewDetailPage";
import AdminQuickReviewsPage from "./pages/AdminQuickReviewsPage";
import PublicLayout from "./components/PublicLayout";
import PublicQuickReviewsPage from "./pages/PublicQuickReviewsPage";
import PublicQuickReviewDetailPage from "./pages/PublicQuickReviewDetailPage";
import SampleQuestionsPage from "./pages/SampleQuestionsPage";

export function AppRoutes() {
  return (
    <>
      <RouteMetadata />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/quick-reviews" element={<PublicQuickReviewsPage />} />
        <Route
          path="/quick-reviews/:slug"
          element={<PublicQuickReviewDetailPage />}
        />
        <Route path="/sample-questions" element={<SampleQuestionsPage />} />
        </Route>
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user-signup" element={<UserSignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/email-preferences" element={<EmailPreferencesPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* Protected user routes */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedUserRoute>
              <UserDashboardPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedUserRoute>
              <UserPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/mistakes"
          element={
            <ProtectedUserRoute>
              <MistakesPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/request-subject"
          element={
            <ProtectedUserRoute>
              <SubjectRequestPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/subject/:subjectId/topics"
          element={
            <ProtectedUserRoute>
              <TopicSelectionPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/test/subject/:subjectId"
          element={
            <ProtectedUserRoute>
              <SubjectTestPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/subject/:subjectId/quick-review"
          element={
            <ProtectedUserRoute>
              <QuickReviewListPage />
            </ProtectedUserRoute>
          }
        />

        <Route
          path="/quick-review/topic/:topicId"
          element={
            <ProtectedUserRoute>
              <QuickReviewDetailPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/test/topic/:topicId"
          element={
            <ProtectedUserRoute>
              <SubjectTestPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/test/:subjectId"
          element={
            <ProtectedUserRoute>
              <SubjectTestPage />
            </ProtectedUserRoute>
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/add-subject" element={<Navigate to="/admin-courses" replace />} />
        <Route
          path="/admin-quick-reviews"
          element={
            <ProtectedAdminRoute>
              <AdminQuickReviewsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/add-topic" element={<Navigate to="/admin-courses" replace />} />
        <Route
          path="/add-question"
          element={
            <ProtectedAdminRoute>
              <AddQuestionPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/bulk-import" element={<Navigate to="/add-question?tab=bulk" replace />} />
        <Route path="/manage-subjects" element={<Navigate to="/admin-courses" replace />} />
        <Route path="/manage-topics" element={<Navigate to="/admin-courses" replace />} />
        <Route
          path="/admin-digest"
          element={
            <ProtectedAdminRoute>
              <AdminDigestPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-reports"
          element={
            <ProtectedAdminRoute>
              <AdminQuestionReportsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-requests"
          element={
            <ProtectedAdminRoute>
              <AdminRequestsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/manage-questions"
          element={
            <ProtectedAdminRoute>
              <ManageQuestionsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/admin-user-management" element={<Navigate to="/admin-users" replace />} />
        <Route
          path="/admin-notifications"
          element={
            <ProtectedAdminRoute>
              <AdminNotifyUsersPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-courses"
          element={
            <ProtectedAdminRoute>
              <AdminCoursesPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedAdminRoute>
              <AdminUsersPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/network-error" element={<NetworkErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

export default App;
