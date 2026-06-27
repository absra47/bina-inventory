"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("bina-theme");
    if (saved === "light") setTheme("light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("bina-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("bina-theme", "dark");
    }
  }

  return (
    <button
      onClick={toggle}
      className="opacity-80 hover:opacity-100 transition-opacity"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
    </button>
  );
}
