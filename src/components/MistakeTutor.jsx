import { useEffect, useId, useRef, useState } from "react";
import api from "../lib/api";
import "./MistakeTutor.css";

function PracticeCheck({ practice, disabled, onAnswer }) {
  const [selected, setSelected] = useState("");
  const id = useId();
  const answered = practice.answer !== undefined;
  return <fieldset className="mistake-tutor__practice" disabled={disabled || answered}>
    <legend>Try the idea in a new question</legend>
    <p>{practice.questionText}</p>
    {practice.options.map((option, index) => <label key={option} className={
      "mistake-tutor__option" + (answered && option === practice.correctAnswer ? " mistake-tutor__option--correct" : "")
    }>
      <input type="radio" name={id} value={option}
        checked={(answered ? practice.answer : selected) === option}
        onChange={() => setSelected(option)} />
      <span><b>{String.fromCharCode(65 + index)}.</b> {option}
        {answered && option === practice.correctAnswer && <strong> — Correct answer</strong>}
      </span>
    </label>)}
    {!answered && <button type="button" className="mistake-tutor__primary" disabled={disabled || !selected}
      onClick={() => onAnswer(selected)}>Check my reasoning</button>}
  </fieldset>;
}

export default function MistakeTutor({ resultId, questionId }) {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);
  const pendingRef = useRef(null);
  const inputRef = useRef(null);
  const id = useId();
  const path = `/api/results/${resultId}/questions/${questionId}/tutor`;

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function load() {
    if (controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true); setError("");
    try {
      const response = await api.post(path, {}, { _tokenType: "user", signal: controller.signal });
      if (controller.signal.aborted) return;
      setConversation(response.data);
      if (response.data.lastRequestId === pendingRef.current?.requestId) setDraft("");
      pendingRef.current = null;
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (!controller.signal.aborted) { controllerRef.current = null; setBusy(false); }
    }
  }

  async function send(payload) {
    if (controllerRef.current || !conversation) return;
    const body = payload || pendingRef.current;
    if (!body) return;
    pendingRef.current = body;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true); setError("");
    try {
      const response = await api.post(path + "/messages", body, { _tokenType: "user", signal: controller.signal });
      if (controller.signal.aborted) return;
      setConversation(response.data); setDraft(""); pendingRef.current = null;
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (!controller.signal.aborted) { controllerRef.current = null; setBusy(false); }
    }
  }

  const pendingPractice = conversation?.turns.at(-1)?.practice;
  const awaitingAnswer = pendingPractice && pendingPractice.answer === undefined;
  const exhausted = conversation?.remainingReplies === 0;
  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    send({ requestId: crypto.randomUUID(), version: conversation.version, message: draft.trim() });
  };
  return <section className="mistake-tutor" aria-label="Guided mistake review">
    <button type="button" className="mistake-tutor__toggle" aria-expanded={open} aria-controls={id}
      onClick={() => { setOpen(!open); if (!open && !conversation) load(); }}>
      <span className="mistake-tutor__icon" aria-hidden="true">↗</span>
      <span><strong>Help me understand my mistake</strong><small>Work through your thinking, then try the idea again.</small></span>
      <span aria-hidden="true">{open ? "−" : "+"}</span>
    </button>
    {open && <div id={id} className="mistake-tutor__body">
      <div className="mistake-tutor__steps" aria-label="Learning steps">
        <span>1 · Your reasoning</span><span>2 · Work through it</span><span>3 · Try again</span>
      </div>
      {conversation && <p className="mistake-tutor__source">AI tutor · {conversation.grounding}<br />Gemini receives this question and your messages to help with your review.</p>}
      <div role="log" aria-live="polite" aria-label="Tutor conversation">
        {conversation?.turns.map((turn, index) => <div key={index} className={`mistake-tutor__turn mistake-tutor__turn--${turn.role}`}>
          <span className="mistake-tutor__speaker">{turn.role === "user" ? "You" : "Tutor"}</span>
          <p>{turn.text}</p>
          {turn.practice && <PracticeCheck practice={turn.practice} disabled={busy || Boolean(error)}
            onAnswer={(answer) => send({ requestId: crypto.randomUUID(), version: conversation.version, answer })} />}
        </div>)}
      </div>
      {busy && <p role="status" className="mistake-tutor__status">{conversation ? "Thinking through your reply…" : "Opening your guided review…"}</p>}
      {error && <div role="alert" className="mistake-tutor__error">
        <p>{error}</p>
        <div className="mistake-tutor__actions">
          {pendingRef.current && <button type="button" disabled={busy} onClick={() => send()}>Retry reply</button>}
          <button type="button" disabled={busy} onClick={load}>Reload conversation</button>
        </div>
      </div>}
      {conversation && !awaitingAnswer && !exhausted && <form onSubmit={submit}>
        <label htmlFor={`${id}-reply`}>What were you thinking?</label>
        <textarea id={`${id}-reply`} ref={inputRef} value={draft} maxLength={1200} rows={3}
          placeholder="I chose this because…" disabled={busy || Boolean(error) || conversation.busy}
          onChange={event => setDraft(event.target.value)} />
        {conversation.turns.length === 1 && <div className="mistake-tutor__actions">
          <button type="button" disabled={busy || Boolean(error)} onClick={() => setDraft("I was guessing and would like help finding the important clue.")}>I was guessing</button>
          <button type="button" disabled={busy || Boolean(error)} onClick={() => setDraft("I was unsure which clue distinguished the options.")}>I was stuck between options</button>
        </div>}
        <div className="mistake-tutor__compose-footer"><small>{draft.length}/1200</small>
          <button type="submit" className="mistake-tutor__primary" disabled={busy || !draft.trim() || Boolean(error) || conversation.busy}>Send my reasoning</button>
        </div>
      </form>}
      {exhausted && !awaitingAnswer && <p className="mistake-tutor__status">You’ve reached the end of this guided conversation. Revisit it anytime, or work through another missed question.</p>}
      {conversation?.busy && !busy && <button type="button" onClick={load}>Refresh pending reply</button>}
    </div>}
  </section>;
}
