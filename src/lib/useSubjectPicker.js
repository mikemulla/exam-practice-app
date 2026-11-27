import { useEffect, useState } from "react";
import api from "./api";
import { ADMIN, listOf } from "./adminKit";

// Course → level → subject → topic choice kept in the page address, shared by the admin content pages.
export function useSubjectPicker(params, setParams) {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [version, setVersion] = useState(0);
  const courseId = params.get("courseId") || "";
  const level = params.get("level") || "";
  const subjectId = params.get("subjectId") || "";
  const topicId = params.get("topicId") || "";

  useEffect(() => {
    api.get("/api/courses?limit=100").then((r) => setCourses(listOf(r.data, "courses"))).catch(() => {});
    api.get("/api/admin/content", ADMIN).then((r) => setSubjects(r.data.subjects)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    let alive = true;
    api.get(`/api/admin/subjects/${subjectId}/topics`, ADMIN).then((r) => alive && setTopics(r.data.topics)).catch(() => alive && setTopics([]));
    return () => {
      alive = false;
    };
  }, [subjectId, version]);

  const subject = subjects.find((s) => s.id === subjectId);
  // Fill in course and level from a subject picked by link.
  const effCourse = courseId || subject?.course?.id || "";
  const effLevel = level || (subject ? String(subject.level) : "");
  const subjectChoices = subjects.filter((s) => (!effCourse || s.course?.id === effCourse) && (!effLevel || String(s.level) === effLevel));

  const set = (patch) => {
    const next = { courseId: effCourse, level: effLevel, subjectId, topicId, ...patch };
    if ("courseId" in patch || "level" in patch) {
      next.subjectId = "";
      next.topicId = "";
    }
    if ("subjectId" in patch) next.topicId = "";
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)));
  };

  return { courses, subjects, subjectChoices, topics: subjectId ? topics : [], courseId: effCourse, level: effLevel, subjectId, topicId, subject, set, reloadTopics: () => setVersion((v) => v + 1) };
}

