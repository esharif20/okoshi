import { useEffect } from "react";
import { ScrollTrigger } from "./gsap";

// The page changes height after load (the Opening sequence is sized once the Edition is known, pictures arrive).
// Scroll positions are measured again whenever it does.
export function useScrollRefresh() {
  useEffect(() => {
    let timer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}
