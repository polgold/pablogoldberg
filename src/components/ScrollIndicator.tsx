"use client";

export function ScrollIndicator() {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleScroll}
      className="flex cursor-pointer flex-col items-center gap-2 text-white/80 transition-colors hover:text-white"
      aria-label="Scroll to content"
    >
      <span className="text-[11px] uppercase tracking-[0.18em]">Scroll</span>
      <span className="inline-flex h-6 w-6 items-center justify-center animate-bounce text-xl leading-none">↓</span>
    </button>
  );
}
