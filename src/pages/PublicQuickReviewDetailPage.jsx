import { Link, useParams } from "react-router-dom";
import { publicReviews, sampleQuestions } from "../data/publicReviews";
import NotFoundPage from "./NotFoundPage";

export default function PublicQuickReviewDetailPage() {
  const { slug } = useParams();
  const review = publicReviews.find(item => item.slug === slug);
  if (!review) return <NotFoundPage />;
  const related = review.relatedSlugs.map(slug => publicReviews.find(item => item.slug === slug)).filter(Boolean);
  return <main className="study-page"><article className="study-article">
    <nav aria-label="Breadcrumb" className="study-breadcrumb"><Link to="/">Home</Link><span aria-hidden="true"> / </span><Link to="/quick-reviews">Quick Reviews</Link><span aria-hidden="true"> / </span><span>{review.subject}</span></nav>
    <header><p className="study-eyebrow">{review.subject}</p><h1>{review.title}</h1>
      <p className="study-meta">By <Link to="/about">{review.author}</Link> · Updated <time dateTime="2026-10-11">{review.updated}</time> · {review.readingTime}</p>
      <p className="study-lead">{review.summary}</p>
      <p className="study-note">A student revision resource, not a clinical protocol. The examples are fictional. Use current local guidance and supervised teaching for patient care. <Link to="/about#editorial">How these notes are produced</Link>.</p>
    </header>
    <section className="study-panel"><h2>What you should be able to explain</h2><ul>{review.objectives.map(item => <li key={item}>{item}</li>)}</ul></section>
    <nav className="study-contents" aria-label="Article contents"><strong>In this review</strong><ul>{review.sections.map((section, index) => <li key={section.heading}><a href={`#section-${index}`}>{section.heading}</a></li>)}<li><a href="#reasoning">Connect the findings</a></li><li><a href="#worked-example">Worked example</a></li><li><a href="#references">References and further reading</a></li></ul></nav>
    {review.sections.map((section, index) => <section id={`section-${index}`} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(p => <p key={p}>{p}</p>)}<ul>{section.points.map(p => <li key={p}>{p}</li>)}</ul></section>)}
    <section id="reasoning"><h2>Connect the findings</h2><p>{review.explanation}</p>
      <div className="study-table-wrap" role="region" aria-label="Study comparison" tabIndex={0}><table><caption>{review.subject}: points to compare</caption><thead><tr>{review.table.headings.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{review.table.rows.map(row => <tr key={row[0]}>{row.map((cell,i) => i === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>
    </section>
    <section id="worked-example" className="study-panel"><h2>Worked example</h2><p><strong>Question:</strong> {review.case.prompt}</p><h3>Reasoning</h3><p>{review.case.reasoning}</p></section>
    <section><h2>A common mistake</h2><p>{review.pitfall}</p><h3>Exam tips</h3><ul>{review.examTips.map(tip => <li key={tip}>{tip}</li>)}</ul></section>
    <section><h2>Check your understanding</h2><p>{review.recall.question}</p><details><summary>Read the explanation</summary><p>{review.recall.answer}</p></details><p><Link to={sampleQuestions.some(q => q.reviewSlug === review.slug) ? `/sample-questions#${review.slug}` : "/sample-questions"}>Practise with worked sample questions</Link></p></section>
    <section id="references"><h2>References and further reading</h2><p>Use these sources to explore the concepts and check the applicable guidance. External organisations do not endorse or clinically review Bambo's notes.</p><ul>{review.sources.map(source => <li key={source.url}><a href={source.url}>{source.title}</a></li>)}</ul><p>Found an unclear or incorrect statement? <Link to="/contact">Send a correction</Link> with the article title, the passage and a supporting reference.</p></section>
    <aside><h2>Continue studying</h2><ul>{related.map(item => <li key={item.slug}><Link to={`/quick-reviews/${item.slug}`}>{item.title}</Link></li>)}</ul><Link to="/quick-reviews">Browse all reviews</Link></aside>
    <section className="study-panel"><h2>Put the explanation into practice</h2><p>Read the <Link to="/sample-questions">public worked questions</Link> or <Link to="/user-signup">create an account</Link> for topic tests and progress tracking.</p></section>
  </article></main>;
}
