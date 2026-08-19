import { useHideHydrationSkeleton } from "./hydration-skeleton.js";

type HeroAction = {
  href: string;
  label: string;
  secondary?: boolean;
};

type VideoSrc = string | { src: string; width?: number; height?: number };

type PortalHeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  actions: HeroAction[];
  videoSrc?: VideoSrc;
  videoPoster?: string;
};

function resolveVideoSrc(video: VideoSrc | undefined): string | undefined {
  if (!video) return undefined;
  if (typeof video === "string") return video;
  return video.src;
}

export function PortalHero({
  kicker,
  title,
  subtitle,
  actions,
  videoSrc,
  videoPoster,
}: PortalHeroProps) {
  const resolvedVideoSrc = resolveVideoSrc(videoSrc);
  const heroRef = useHideHydrationSkeleton<HTMLElement>();

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-media" aria-hidden="true">
        {resolvedVideoSrc ? (
          <video
            className="hero-video"
            src={resolvedVideoSrc}
            poster={videoPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : null}
      </div>
      <div className="hero-content">
        <p className="hero-kicker">{kicker}</p>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>

        <div className="hero-actions">
          {actions.map((action) => (
            <a
              className={action.secondary ? "button secondary" : "button"}
              href={action.href}
              key={`${action.href}-${action.label}`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
