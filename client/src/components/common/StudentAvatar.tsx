import React, { useEffect, useState } from 'react';

interface StudentAvatarProps {
  name?: string;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
}

const getInitials = (name?: string): string => {
  const parts = (name || 'Student').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ST';
  return `${parts[0][0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
};

/**
 * Renders the avatar stored in the student profile database.
 * When no picture is set (or the file cannot be loaded) it shows the
 * student's initials instead of borrowing another student's photo.
 */
export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  name,
  src,
  className = '',
  fallbackClassName = '',
  alt,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const hasImage = Boolean(src && src.trim()) && !failed;

  if (!hasImage) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-200 text-slate-600 font-bold select-none ${fallbackClassName}`}
        title={name}
        aria-label={alt || name || 'Student'}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src as string}
      alt={alt || name || 'Student'}
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
