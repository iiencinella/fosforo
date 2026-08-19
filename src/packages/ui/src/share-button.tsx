import { useState, useRef, useEffect } from "react";

type ShareButtonProps = {
  url: string;
  title: string;
  text: string;
  className?: string;
};

const SOCIAL_NETWORKS = [
  {
    name: "Facebook",
    icon: "📘",
    getUrl: (url: string, title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
  },
  {
    name: "X",
    icon: "🐦",
    getUrl: (url: string, title: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title}\n\n${text}`)}`,
  },
  {
    name: "WhatsApp",
    icon: "💬",
    getUrl: (url: string, title: string, text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${text}\n\n${url}`)}`,
  },
  {
    name: "LinkedIn",
    icon: "💼",
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export function ShareButton({ url, title, text, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleShare(network: (typeof SOCIAL_NETWORKS)[number]) {
    const shareUrl = network.getUrl(url, title, text);
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");
    setOpen(false);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled
      }
    }
    setOpen(false);
  }

  return (
    <div
      className={`share-button-wrapper${className ? ` ${className}` : ""}`}
      ref={menuRef}
    >
      <button
        type="button"
        className="button secondary share-button-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Compartir"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </button>

      {open ? (
        <div className="share-button-menu" role="menu">
          {SOCIAL_NETWORKS.map((network) => (
            <button
              key={network.name}
              type="button"
              className="share-button-item"
              role="menuitem"
              onClick={() => handleShare(network)}
            >
              <span>{network.icon}</span>
              <span>{network.name}</span>
            </button>
          ))}
          <button
            type="button"
            className="share-button-item"
            role="menuitem"
            onClick={handleCopyLink}
          >
            <span>🔗</span>
            <span>{copied ? "Copiado!" : "Copiar enlace"}</span>
          </button>
          {"share" in navigator ? (
            <button
              type="button"
              className="share-button-item"
              role="menuitem"
              onClick={handleNativeShare}
            >
              <span>📤</span>
              <span>Compartir...</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
