import { jwtDecode } from "jwt-decode";
import api from "./api";

// Is a student logged in on this device right now? (Safe to call only in the browser.)
export function hasStudentSession() {
  if (typeof window === "undefined") return false;
  try {
    const token = localStorage.getItem("userToken");
    if (!token) return false;
    const d = jwtDecode(token);
    return d.role === "user" && Boolean(d.userId) && (!d.exp || d.exp * 1000 > Date.now());
  } catch {
    return false;
  }
}

export function studentId() {
  try {
    return jwtDecode(localStorage.getItem("userToken") || "").userId || "";
  } catch {
    return "";
  }
}

let refreshed = false;
// Keep active students logged in: once per visit, swap a login older than 12 hours for a fresh 7-day one.
export async function refreshStudentLogin() {
  if (refreshed || !hasStudentSession()) return;
  refreshed = true;
  try {
    const d = jwtDecode(localStorage.getItem("userToken"));
    if (d.iat && Date.now() - d.iat * 1000 < 12 * 60 * 60 * 1000) return;
    const res = await api.post("/api/me/refresh", {}, { _tokenType: "user" });
    if (res.data?.token) localStorage.setItem("userToken", res.data.token);
  } catch {
    /* if it fails the current login still works until it expires */
  }
}

// Bump this when the app changes enough that everyone should see the intro tour again.
export const TOUR_VERSION = 1;
