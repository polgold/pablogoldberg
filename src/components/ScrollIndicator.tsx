"use client";

export function ScrollIndicator() {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
      aria-hidden
    >
      <span className="font-body text-[10px] uppercase tracking-[0.3em]">Scroll</span>
      <span className="block h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
    </div>
  );
}
