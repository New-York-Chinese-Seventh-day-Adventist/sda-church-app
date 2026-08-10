/**
 * Public PWA assets are deployed beneath the GitHub Pages project path.
 * Root-relative URLs keep metadata working from every statically rendered route.
 */
export const PWA_BASE_PATH = '/sda-church-app/' as const;

export function getPwaAssetHref(assetName: string): string {
  return `${PWA_BASE_PATH}${assetName.replace(/^\/+/, '')}`;
}

export const PWA_MANIFEST_HREF = getPwaAssetHref('manifest.json');
export const PWA_ICON_192_HREF = getPwaAssetHref('icon-192x192.png');
export const PWA_ICON_512_HREF = getPwaAssetHref('icon-512x512.png');
