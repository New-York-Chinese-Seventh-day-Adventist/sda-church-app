import RootHtml from '@/app/+html';
import {
  getPwaAssetHref,
  PWA_BASE_PATH,
  PWA_ICON_192_HREF,
  PWA_ICON_512_HREF,
  PWA_MANIFEST_HREF,
} from '@/constants/PwaAssets';
import manifest from '@/public/manifest.json';
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

describe('PWA asset paths', () => {
  it('resolves metadata to the project root from nested GitHub Pages routes', () => {
    const nestedRoute = 'https://example.test/sda-church-app/you/';

    expect(new URL(PWA_MANIFEST_HREF, nestedRoute).href).toBe(
      'https://example.test/sda-church-app/manifest.json',
    );
    expect(new URL(PWA_ICON_192_HREF, nestedRoute).href).toBe(
      'https://example.test/sda-church-app/icon-192x192.png',
    );
    expect(new URL(PWA_ICON_512_HREF, nestedRoute).href).toBe(
      'https://example.test/sda-church-app/icon-512x512.png',
    );
  });

  it('normalizes asset names beneath the configured project base', () => {
    expect(PWA_BASE_PATH).toBe('/sda-church-app/');
    expect(getPwaAssetHref('/manifest.json')).toBe(PWA_MANIFEST_HREF);
    expect(getPwaAssetHref('icons/example.png')).toBe(
      '/sda-church-app/icons/example.png',
    );
  });

  it('keeps manifest navigation and icon paths aligned with the app base', () => {
    expect(manifest.start_url).toBe(PWA_BASE_PATH);
    expect(manifest.scope).toBe(PWA_BASE_PATH);
    expect(manifest.icons.map((icon) => icon.src)).toEqual([
      PWA_ICON_192_HREF,
      PWA_ICON_512_HREF,
    ]);
  });

  it('renders base-aware metadata links into the static HTML document', () => {
    const document = RootHtml({ children: null });
    const head = Children.toArray(document.props.children).find(
      (child) => isValidElement(child) && child.type === 'head',
    ) as ReactElement<{ children?: ReactNode }>;
    const links = Children.toArray(head.props.children)
      .filter(
        (child): child is ReactElement<Record<string, string>> =>
          isValidElement(child) && child.type === 'link',
      )
      .map(({ props }) => props);

    expect(links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: PWA_ICON_192_HREF,
          rel: 'apple-touch-icon',
        }),
        expect.objectContaining({ href: PWA_ICON_192_HREF, rel: 'icon' }),
        expect.objectContaining({ href: PWA_ICON_512_HREF, rel: 'icon' }),
        expect.objectContaining({ href: PWA_MANIFEST_HREF, rel: 'manifest' }),
      ]),
    );
  });
});
