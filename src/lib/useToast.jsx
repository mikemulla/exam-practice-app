import { useEffect, useState } from "react";

// A short message at the bottom of the screen, e.g. "Saved".
export function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);
  const node = toast ? <div className={`adm-toast${toast.bad ? " bad" : ""}`} role="status">{toast.text}</div> : null;
  return [node, (text, bad = false) => setToast({ text, bad })];
}
