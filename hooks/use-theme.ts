"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeHook() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      theme: "system",
      setTheme: () => null,
      systemTheme,
      mounted: false,
    };
  }

  return {
    theme,
    setTheme,
    systemTheme,
    mounted,
  };
} 