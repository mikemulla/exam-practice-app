import { renderToString } from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "./context/DarkModeContext";
import PublicLayout from "./components/PublicLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import PublicQuickReviewsPage from "./pages/PublicQuickReviewsPage";
import PublicQuickReviewDetailPage from "./pages/PublicQuickReviewDetailPage";
import SampleQuestionsPage from "./pages/SampleQuestionsPage";
import NotFoundPage from "./pages/NotFoundPage";

export function render(path) {
  return renderToString(<StaticRouter location={path}><DarkModeProvider>
    <Routes><Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/quick-reviews" element={<PublicQuickReviewsPage />} />
      <Route path="/quick-reviews/:slug" element={<PublicQuickReviewDetailPage />} />
      <Route path="/sample-questions" element={<SampleQuestionsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route></Routes>
  </DarkModeProvider></StaticRouter>);
}
