import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMetadata } from "../lib/pageMetadata";
// Route metadata is also generated into the initial HTML during the build.
export default function usePageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = getPageMetadata(pathname).title; }, [pathname]);
}
