import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import AddSubjectPage from "./pages/AddSubjectPage";
import AddQuestionPage from "./pages/AddQuestionPage";
import AddTopicPage from "./pages/AddTopicPage";
import ManageTopicsPage from "./pages/ManageTopicsPage";
import BulkImportQuestionsPage from "./pages/BulkImportQuestionsPage";
import ManageSubjectsPage from "./pages/ManageSubjectsPage";
import ManageQuestionsPage from "./pages/ManageQuestionsPage";
import SubjectTestPage from "./pages/SubjectTestPage";
import SubjectRequestPage from "./pages/SubjectRequestPage";
import TopicSelectionPage from "./pages/TopicSelectionPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminRequestsPage from "./pages/AdminRequestdPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminNotifyUsersPage from "./pages/AdminNotifyUsersPage";
import UserLoginPage from "./pages/UserLoginPage";
import UserSignupPage from "./pages/UserSignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import UserDashboardPage from "./pages/UserDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user-signup" element={<UserSignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
        <Route
          path="/add-subject"
          element={
            <ProtectedAdminRoute>
              <AddSubjectPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/add-topic"
          element={
            <ProtectedAdminRoute>
              <AddTopicPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/add-question"
          element={
            <ProtectedAdminRoute>
              <AddQuestionPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/bulk-import"
          element={
            <ProtectedAdminRoute>
              <BulkImportQuestionsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/manage-subjects"
          element={
            <ProtectedAdminRoute>
              <ManageSubjectsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/manage-topics"
          element={
            <ProtectedAdminRoute>
              <ManageTopicsPage />
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
        <Route
          path="/admin-notifications"
          element={
            <ProtectedAdminRoute>
              <AdminNotifyUsersPage />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
