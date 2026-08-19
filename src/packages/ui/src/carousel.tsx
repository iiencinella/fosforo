import { type ReactNode, useEffect, useRef, useState } from "react";

export type CardCarouselProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export type CarouselCardProps = {
  title: ReactNode;
  description?: ReactNode;
  badge?: string;
  selected?: boolean;
  onSelect?: () => void;
  size?: "md" | "lg";
};

function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {direction === "prev" ? (
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ) : (
        <path
          d="M9 5l7 7-7 7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}

export function CardCarousel({
  label,
  children,
  className,
}: CardCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function syncScrollState() {
      if (!track) return;
      setCanScrollPrev(track.scrollLeft > 4);
      setCanScrollNext(
        track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
      );
    }

    syncScrollState();
    track.addEventListener("scroll", syncScrollState, { passive: true });
    const observer = new ResizeObserver(syncScrollState);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", syncScrollState);
      observer.disconnect();
    };
  }, [children]);

  function scrollByPage(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.75,
      behavior: "smooth",
    });
  }

  return (
    <div className={`card-carousel${className ? ` ${className}` : ""}`}>
      <div
        className="card-carousel-track"
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
      <div className="card-carousel-nav">
        <button
          type="button"
          className="button secondary card-carousel-arrow"
          aria-label={`${label}: anterior`}
          disabled={!canScrollPrev}
          onClick={() => scrollByPage(-1)}
        >
          <ArrowIcon direction="prev" />
        </button>
        <button
          type="button"
          className="button secondary card-carousel-arrow"
          aria-label={`${label}: siguiente`}
          disabled={!canScrollNext}
          onClick={() => scrollByPage(1)}
        >
          <ArrowIcon direction="next" />
        </button>
      </div>
    </div>
  );
}

export function CarouselCard({
  title,
  description,
  badge,
  selected = false,
  onSelect,
  size = "md",
}: CarouselCardProps) {
  return (
    <button
      type="button"
      className={`card-carousel-card card-carousel-card--${size}${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {badge ? <span className="badge">{badge}</span> : null}
      <span className="card-carousel-card-title">{title}</span>
      {description ? (
        <span className="card-carousel-card-desc">{description}</span>
      ) : null}
    </button>
  );
}
