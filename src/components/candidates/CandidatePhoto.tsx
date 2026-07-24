import { useState } from 'react';

interface CandidatePhotoProps {
  name: string;
  photoUrl: string | null;
  className?: string;
}

export function CandidatePhoto({
  name,
  photoUrl,
  className = ''
}: CandidatePhotoProps) {
  const [failed, setFailed] = useState(false);
  const src = !photoUrl || failed
    ? '/placeholder-candidate.svg'
    : photoUrl;

  return (
    <img
      src={src}
      alt={`Foto de ${name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
