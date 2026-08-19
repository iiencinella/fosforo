import { useState } from "react";

type ShareButtonsProps = {
  url: string;
  title: string;
  text: string;
};

const SOCIAL_NETWORKS = [
  {
    name: "Facebook",
    icon: "📘",
    color: "#1877f2",
    getUrl: (url: string, title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
  },
  {
    name: "X (Twitter)",
    icon: "🐦",
    color: "#000000",
    getUrl: (url: string, title: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title}\n\n${text}`)}`,
  },
  {
    name: "LinkedIn",
    icon: "💼",
    color: "#0a66c2",
    getUrl: (url: string, title: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "WhatsApp",
    icon: "💬",
    color: "#25d366",
    getUrl: (url: string, title: string, text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${text}\n\n${url}`)}`,
  },
];

export function ShareButtons({ url, title, text }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function handleShare(network: (typeof SOCIAL_NETWORKS)[number]) {
    const shareUrl = network.getUrl(url, title, text);
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch {
        // User cancelled or error
      }
    }
  }

  return (
    <div className="share-buttons">
      <h3 className="share-title">Compartir lectura</h3>
      <p className="share-subtitle">
        Fomenta la lectura de la Biblia compartiendo con otros
      </p>

      <div className="share-grid">
        {SOCIAL_NETWORKS.map((network) => (
          <button
            key={network.name}
            type="button"
            className="share-btn"
            style={{ "--brand-color": network.color } as React.CSSProperties}
            onClick={() => handleShare(network)}
            aria-label={`Compartir en ${network.name}`}
          >
            <span className="share-btn-icon">{network.icon}</span>
            <span className="share-btn-label">{network.name}</span>
          </button>
        ))}
      </div>

      <div className="share-actions">
        <button
          type="button"
          className="share-action-btn"
          onClick={handleCopyLink}
        >
          {copied ? "✓ Enlace copiado" : "🔗 Copiar enlace"}
        </button>

        {"share" in navigator ? (
          <button
            type="button"
            className="share-action-btn"
            onClick={handleNativeShare}
          >
            📤 Compartir...
          </button>
        ) : null}
      </div>

      <div className="share-preview">
        <p className="share-preview-label">Vista previa del enlace:</p>
        <div className="share-preview-card">
          <div className="share-preview-image">
            <img src="/og-biblia.svg" alt="Biblia Fósforo" />
          </div>
          <div className="share-preview-info">
            <p className="share-preview-domain">biblia.fosforo.org</p>
            <p className="share-preview-title">{title}</p>
            <p className="share-preview-text">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
