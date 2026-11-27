import { LEVELS } from "../lib/adminKit";

export default function PickerFields({ picker, needTopic = false }) {
  const { courses, subjectChoices, topics, courseId, level, subjectId, topicId, set } = picker;
  return (
    <>
      <label className="adm-field">Course
        <select className="adm-in" value={courseId} onChange={(e) => set({ courseId: e.target.value })}>
          <option value="">All courses</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </label>
      <label className="adm-field">Level
        <select className="adm-in" value={level} onChange={(e) => set({ level: e.target.value })}>
          <option value="">All levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </label>
      <label className="adm-field">Subject
        <select className="adm-in" value={subjectId} onChange={(e) => set({ subjectId: e.target.value })}>
          <option value="">Choose a subject</option>
          {subjectChoices.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.level}L{courseId ? "" : ` · ${s.course?.name || ""}`}</option>)}
        </select>
      </label>
      <label className="adm-field">Topic
        <select className="adm-in" value={topicId} disabled={!subjectId} onChange={(e) => set({ topicId: e.target.value })}>
          <option value="">{needTopic ? "Choose a topic" : "All topics"}</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.questions})</option>)}
        </select>
      </label>
    </>
  );
}

