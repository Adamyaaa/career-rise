"use client";

import { useState, useEffect } from "react";
import { Palette, Check, Sparkles, X, ChevronUp, SlidersHorizontal } from "lucide-react";

export interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "electric",
    name: "Electric Sapphire",
    tagline: "Signature Brand Match",
    primaryColor: "#006bf8",
    accentColor: "#dbeafe",
    bgColor: "#f8fafc",
    description: "Vibrant electric blue matching the logo gradient arrow & Rise lettering.",
  },
  {
    id: "sky",
    name: "Sky Azure",
    tagline: "Cyan & Sky Glow",
    primaryColor: "#0284c7",
    accentColor: "#e0f2fe",
    bgColor: "#f0f9ff",
    description: "Lighter cyan-blue inspired by the bright gradient tips in the logo.",
  },
  {
    id: "royal",
    name: "Royal Cobalt",
    tagline: "Executive & Prestigious",
    primaryColor: "#1d4ed8",
    accentColor: "#e0e7ff",
    bgColor: "#fafafa",
    description: "Deep, high-trust royal cobalt with clean contrast and crisp cards.",
  },
  {
    id: "indigo",
    name: "Modern Indigo",
    tagline: "Tech-Forward Blue",
    primaryColor: "#4f46e5",
    accentColor: "#ede9fe",
    bgColor: "#f8f9fc",
    description: "Dynamic blue-indigo reflecting the modern tech spirit.",
  },
  {
    id: "minimal",
    name: "Clean Minimalist",
    tagline: "Pure White & Tech Blue",
    primaryColor: "#2563eb",
    accentColor: "#e2e8f0",
    bgColor: "#ffffff",
    description: "Ultra clean white backdrop with refined, sharp blue accents.",
  },
];

const STORAGE_KEY = "cr_test_theme";

export function ThemeTester() {
  const [activeTheme, setActiveTheme] = useState<string>("electric");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) {
      setActiveTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "electric");
    }
  }, []);

  const selectTheme = (themeId: string) => {
    setActiveTheme(themeId);
    localStorage.setItem(STORAGE_KEY, themeId);
    document.documentElement.setAttribute("data-theme", themeId);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
      {isOpen ? (
        <div className="mb-2.5 w-84 sm:w-96 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Palette className="size-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground leading-tight">Theme Testing Lab</h4>
                <p className="text-[11px] text-muted-foreground">Light Blue Themes · Logo-Inspired</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close theme tester"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="my-3 space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme.id)}
                  className={`w-full text-left rounded-xl p-2.5 border transition-all flex items-start gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                      : "border-border/60 bg-background/50 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <div
                      className="size-7 rounded-lg border border-black/10 shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      {isSelected ? (
                        <Check className="size-4 text-white stroke-[2.5]" />
                      ) : (
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-foreground truncate">{theme.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-primary/85 font-medium">{theme.tagline}</p>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-primary" />
              <span>Light mode testing branch</span>
            </span>
            <button
              onClick={() => selectTheme("electric")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset Default
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3.5 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md hover:bg-muted hover:border-primary/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <span
          className="size-3 rounded-full border border-black/10 shadow-2xs"
          style={{
            backgroundColor:
              THEMES.find((t) => t.id === activeTheme)?.primaryColor || "#006bf8",
          }}
        />
        <span>Test Light Themes</span>
        <SlidersHorizontal className="size-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
