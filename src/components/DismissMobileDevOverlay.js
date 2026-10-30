"use client";

import { useEffect } from "react";

/** L’overlay d’erreur Next.js occupe tout l’écran sur téléphone. En local, on le retire. */
export default function DismissMobileDevOverlay() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const hide = () => {
      document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
    };

    hide();
    const observer = new MutationObserver(hide);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
