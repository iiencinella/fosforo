export type TeamMemberAvatarProps = {
  name: string;
  profession: string;
  responsibilities: string[];
  imageSrc?: string;
  imageAlt?: string;
  defaultImageSrc?: string;
};

export function TeamMemberAvatar({
  name,
  profession,
  responsibilities,
  imageSrc,
  imageAlt,
  defaultImageSrc,
}: TeamMemberAvatarProps) {
  const resolvedImageSrc = imageSrc ?? defaultImageSrc;
  const resolvedImageAlt = imageAlt ?? `Foto de ${name}`;

  return (
    <article className="team-member-avatar surface-card">
      {resolvedImageSrc ? (
        <div className="team-member-avatar__photo" aria-hidden="true">
          <img src={resolvedImageSrc} alt={resolvedImageAlt} loading="lazy" />
        </div>
      ) : null}

      <div className="team-member-avatar__body">
        <h2 className="team-member-avatar__name">{name}</h2>
        <p className="team-member-avatar__profession">{profession}</p>

        <div className="team-member-avatar__section">
          <h3 className="team-member-avatar__section-title">
            Responsabilidades
          </h3>
          <ul className="team-member-avatar__responsibilities">
            {responsibilities.map((responsibility) => (
              <li key={responsibility}>{responsibility}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
