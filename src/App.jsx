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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/request-subject" element={<SubjectRequestPage />} />
        <Route
          path="/subject/:subjectId/topics"
          element={<TopicSelectionPage />}
        />
        <Route path="/test/subject/:subjectId" element={<SubjectTestPage />} />
        <Route path="/test/topic/:topicId" element={<SubjectTestPage />} />
        <Route path="/test/:subjectId" element={<SubjectTestPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

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
          path="/manage-questions"
          element={
            <ProtectedAdminRoute>
              <ManageQuestionsPage />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
