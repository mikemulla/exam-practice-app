import { publicReviews } from "../data/publicReviews.js";

export const SITE_URL = "https://bambo-app.vercel.app";
const pages = {
  "/": ["Bambo Exam Practice | Free Medical Study Questions", "Learn medical concepts with public study reviews, worked questions and practical revision guidance. Practise independently before creating a Bambo account."],
  "/quick-reviews": ["Free Medical Quick Reviews | Bambo", "Explore medical study reviews with worked examples, comparison tables, references and questions for active recall."],
  "/sample-questions": ["Free Medical Sample Questions | Bambo", "Work through medical exam questions with answers, explanations for each option and links to further study. No account required."],
  "/about": ["About Bambo Exam Practice", "Learn about Bambo, its independent student-led purpose, sources, educational limitations and correction process."],
  "/contact": ["Contact Bambo", "Contact Bambo about study material, corrections, account support or feedback."],
  "/privacy": ["Privacy Policy | Bambo", "How Bambo uses account information, contact messages, browser storage and Google advertising services, and the choices available to you."],
  "/terms": ["Terms of Service | Bambo", "Terms for using Bambo's educational study resources and practice tools."],
};
export const publicPaths = [...Object.keys(pages), ...publicReviews.map(r => `/quick-reviews/${r.slug}`)];
export function getPageMetadata(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const review = publicReviews.find(r => path === `/quick-reviews/${r.slug}`);
  const info = review ? [`${review.title} | Bambo`, review.excerpt] : pages[path];
  return {
    title: info?.[0] || "Bambo Exam Practice",
    description: info?.[1] || "Account, practice or support page for Bambo Exam Practice.",
    indexable: Boolean(info),
    canonical: info ? `${SITE_URL}${path === "/" ? "/" : path}` : null,
  };
}
