// Remembers the browser's "install this app" offer so a button can use it later.
let deferred = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((fn) => fn());
  });
}

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

export const isIos = () => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

export const canPromptInstall = () => Boolean(deferred);

export async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const choice = await deferred.userChoice.catch(() => null);
  deferred = null;
  listeners.forEach((fn) => fn());
  return choice?.outcome === "accepted";
}

export function onInstallChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
