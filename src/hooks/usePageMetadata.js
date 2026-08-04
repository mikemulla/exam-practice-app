import { useEffect } from "react";

export default function usePageMetadata(title, description) {
  useEffect(() => {
    if (!title || !description) return;

    document.title = title;

    const metaDescription =
      document.querySelector('meta[name="description"]') ||
      document.createElement("meta");

    metaDescription.name = "description";
    metaDescription.content = description;

    if (!metaDescription.parentNode) {
      document.head.appendChild(metaDescription);
    }
  }, [title, description]);
}
