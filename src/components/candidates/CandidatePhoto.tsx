import { useState, memo } from 'react';

interface CandidatePhotoProps {
  name: string;
  photoUrl: string | null;
  className?: string;
}

/**
 * Performance optimization: Memoized to prevent unnecessary image re-renders
 * which can cause layout shifts or flicker when parent components re-render.
 */
export const CandidatePhoto = memo(function CandidatePhoto({
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
});
