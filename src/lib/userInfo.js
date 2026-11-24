export function readUserInfo() {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  } catch {
    return {};
  }
}
