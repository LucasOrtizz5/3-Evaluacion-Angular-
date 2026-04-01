export function createFallbackAvatarUrl(seed: string, maxCharacterAvatarId = 826): string {
  const normalizedSeed = seed.trim() || 'guest-user';

  const hash = normalizedSeed
    .split('')
    .reduce((accumulator, current) => ((accumulator << 5) - accumulator + current.charCodeAt(0)) | 0, 0);

  const characterId = (Math.abs(hash) % maxCharacterAvatarId) + 1;
  return `https://rickandmortyapi.com/api/character/avatar/${characterId}.jpeg`;
}

export function resolveAvatarUrl(avatarUrl: string | null | undefined, seed: string): string {
  const normalizedAvatar = avatarUrl?.trim();
  if (normalizedAvatar) {
    return normalizedAvatar;
  }

  return createFallbackAvatarUrl(seed);
}

export function resolveStoredProfileAvatarUrl(userId: string | undefined, userEmail: string | undefined, fallbackSeed: string): string {
  const storageKey = `profile-draft:${userId || userEmail || 'guest-user'}`;
  const rawValue = localStorage.getItem(storageKey);

  if (rawValue) {
    try {
      const parsedValue = JSON.parse(rawValue) as { profileImageUrl?: string };
      const storedAvatar = parsedValue.profileImageUrl?.trim();
      if (storedAvatar) {
        return storedAvatar;
      }
    } catch {
      // Ignore malformed draft data and fall back to the generated placeholder.
    }
  }

  return createFallbackAvatarUrl(fallbackSeed);
}
