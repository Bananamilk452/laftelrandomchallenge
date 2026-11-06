export function imageProxySrc(src: string | null | undefined) {
  if (!src) return null;

  return `/api/image?src=${encodeURIComponent(src)}`;
}
