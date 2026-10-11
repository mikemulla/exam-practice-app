import { Link } from "react-router-dom";
import { publicReviews } from "../data/publicReviews";
export default function PublicStudyIntroduction() {
  return <section className="study-home" aria-labelledby="start-learning">
    <p className="study-eyebrow">Start learning without an account</p>
    <h2 id="start-learning">Understand the reason behind the answer</h2>
    <p>Bambo's public library connects medical concepts to the decisions you make in exam questions. Start with a short review, follow its worked example, then explain the answer in your own words before checking the sample questions.</p>
    <div className="study-card-grid">{publicReviews.slice(0,3).map(review => <article className="study-panel" key={review.slug}><p className="study-eyebrow">{review.subject}</p><h3><Link to={`/quick-reviews/${review.slug}`}>{review.title}</Link></h3><p>{review.excerpt}</p><p>{review.readingTime} · Worked example and references</p></article>)}</div>
    <h3>A practical revision routine</h3>
    <ol><li><strong>Choose one question.</strong> Identify what it asks before looking at the options: diagnosis, mechanism, investigation or next priority.</li><li><strong>Explain the clues.</strong> Write down which observation supports your answer and which would change your mind. Use a review when the mechanism is unclear.</li><li><strong>Compare the alternatives.</strong> Work through why the other options do not fit this particular stem.</li><li><strong>Return to the topic.</strong> Attempt a similar problem later without your notes. Track the reasoning you missed, not just the score.</li></ol>
    <p><Link className="study-action" to="/quick-reviews">Explore all 13 study reviews</Link> <Link className="study-action" to="/sample-questions">Try 10 worked questions</Link></p>
    <p className="study-note">Built for student revision, with a particular focus on the LASUCOM community. Public resources are open to everyone. <Link to="/about">Learn about Bambo and the limits of these materials</Link>.</p>
  </section>;
}
