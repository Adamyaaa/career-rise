"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROMO_EVENT_URL =
  "https://growthx.club/events/build-your-voice-agent?utm_source=app_share";
const PROMO_STORAGE_KEY = "cr_promo_voice_agent_seen_v1";

export function EventPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user already dismissed in this session
    const seen = sessionStorage.getItem(PROMO_STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200); // 1.2s delay for smooth page load first
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(PROMO_STORAGE_KEY, "true");
  };

  const handleInterested = () => {
    window.open(PROMO_EVENT_URL, "_blank", "noopener,noreferrer");
    handleClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Special Event Promotion"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm sm:max-w-md flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Top Header / Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 active:scale-95 shadow-md"
          aria-label="Close promotion"
        >
          <X className="size-4" />
        </button>

        {/* Poster Image (Clickable) */}
        <a
          href={PROMO_EVENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-full overflow-hidden bg-muted"
        >
          <div className="relative aspect-[682/1024] max-h-[68vh] w-full">
            <Image
              src="/promotions/voice-agent-event.png"
              alt="Build Your Own Voice Agent - GrowthX Event"
              fill
              sizes="(max-width: 640px) 90vw, 420px"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </a>

        {/* Footer Actions */}
        <div className="flex items-center gap-2.5 p-3.5 sm:p-4 bg-card border-t border-border/60">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Close this
          </Button>

          <Button
            onClick={handleInterested}
            className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="size-3.5" />
            <span>Interested</span>
            <ExternalLink className="size-3.5 opacity-80" />
          </Button>
        </div>
      </div>
    </div>
  );
}
