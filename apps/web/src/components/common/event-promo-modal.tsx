"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const PROMO_EVENT_URL =
  "https://growthx.club/events/build-your-voice-agent?utm_source=app_share";
const PROMO_STORAGE_KEY = "cr_promo_voice_agent_seen_v1";

export function EventPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = sessionStorage.getItem(PROMO_STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
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
      aria-label="Promotion Ad"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[330px] sm:max-w-[370px] flex-col items-center gap-3 animate-in zoom-in-95 duration-200"
      >
        {/* Floating Close Button in Top Right */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 z-30 flex size-9 items-center justify-center rounded-full bg-black/80 text-white border border-white/20 backdrop-blur-md shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Close ad"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>

        {/* Ad Poster */}
        <a
          href={PROMO_EVENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
        >
          <div className="relative aspect-[682/1024] w-full max-h-[72vh]">
            <Image
              src="/promotions/voice-agent-event.png"
              alt="Build Your Own Voice Agent"
              fill
              sizes="(max-width: 640px) 90vw, 370px"
              className="object-contain rounded-2xl"
              priority
            />
          </div>
        </a>

        {/* Clean Solid Blue Interested Button */}
        <button
          onClick={handleInterested}
          className="w-full rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          Interested
        </button>
      </div>
    </div>
  );
}
