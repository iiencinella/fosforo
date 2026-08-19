type ExternalLinkButtonProps = {
  href: string;
  label: string;
  className?: string;
  openInNewTabText?: string;
};

export function ExternalLinkButton({
  href,
  label,
  className = "",
  openInNewTabText = "(se abre en una nueva pestana)",
}: ExternalLinkButtonProps) {
  const classes = ["button", "secondary", "external-link-button", className]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      className={classes}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
      <span className="external-link-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path
            d="M14 5h5v5m0-5-7 7m-1-5H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </span>
      <span className="sr-only">{openInNewTabText}</span>
    </a>
  );
}

export type { ExternalLinkButtonProps };
