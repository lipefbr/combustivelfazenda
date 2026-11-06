"use client";

import { useEffect } from "react";

const iOS_SPLASHES = [
  { href: "/icons/apple-splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/icons/apple-splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/icons/apple-splash-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/icons/apple-splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
  { href: "/icons/apple-splash-640x1136.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
  { href: "/icons/apple-splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
  { href: "/icons/apple-splash-1668x2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
  { href: "/icons/apple-splash-1536x2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" },
];

export function AppleSplashScreens() {
  useEffect(() => {
    // Injeta os links de splash iOS no <head>
    const existing = document.querySelectorAll('link[rel="apple-touch-startup-image"]');
    if (existing.length > 0) return; // já injetado

    iOS_SPLASHES.forEach((splash) => {
      const link = document.createElement("link");
      link.rel = "apple-touch-startup-image";
      link.href = splash.href;
      link.media = splash.media;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup opcional: não removemos porque os links precisam estar presentes
      // durante o ciclo de vida do PWA
    };
  }, []);

  return null;
}
