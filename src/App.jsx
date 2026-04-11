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
import TopicSelectionPage from "./pages/TopicSelectionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/add-subject" element={<AddSubjectPage />} />
        <Route path="/add-question" element={<AddQuestionPage />} />
        <Route path="/add-topic" element={<AddTopicPage />} />
        <Route
          path="/subject/:subjectId/topics"
          element={<TopicSelectionPage />}
        />
        <Route path="/test/subject/:subjectId" element={<SubjectTestPage />} />
        <Route path="/test/topic/:topicId" element={<SubjectTestPage />} />
        <Route path="/manage-topics" element={<ManageTopicsPage />} />
        <Route
          path="/bulk-import-questions"
          element={<BulkImportQuestionsPage />}
        />
        <Route path="/manage-subjects" element={<ManageSubjectsPage />} />
        <Route path="/manage-questions" element={<ManageQuestionsPage />} />
        <Route path="/test/:subjectId" element={<SubjectTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
