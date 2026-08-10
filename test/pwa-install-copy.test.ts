import {
  getPwaInstallCopy,
  PWA_INSTALL_COPY,
} from '@/constants/PwaInstallCopy';
import type { SupportedLanguage } from '@/constants/LanguageContext';
import {
  PWA_INSTALL_PLATFORMS,
  PWA_INSTALL_STATUSES,
} from '@/services/PwaInstallGuidance';

const languages: readonly SupportedLanguage[] = ['en', 'zh', 'zh-cn', 'es'];

describe('localized PWA installation guidance', () => {
  it('provides every status, platform, action, error, and accessibility label in every language', () => {
    for (const language of languages) {
      const copy = getPwaInstallCopy(language);

      expect(Object.keys(copy.status)).toEqual([...PWA_INSTALL_STATUSES]);
      expect(Object.keys(copy.manualSteps)).toEqual([...PWA_INSTALL_PLATFORMS]);
      expect(copy.menu.title.length).toBeGreaterThan(0);
      expect(copy.menu.description.length).toBeGreaterThan(0);
      expect(copy.dialog.title.length).toBeGreaterThan(0);
      expect(copy.dialog.description.length).toBeGreaterThan(0);
      expect(copy.dialog.manualStepsHeading.length).toBeGreaterThan(0);
      expect(copy.errors.requestFailed.length).toBeGreaterThan(0);
      expect(copy.buttons.install.length).toBeGreaterThan(0);
      expect(copy.buttons.close.length).toBeGreaterThan(0);
      expect(copy.a11y.dialog.length).toBeGreaterThan(0);
      expect(copy.a11y.install.length).toBeGreaterThan(0);
      expect(copy.a11y.close.length).toBeGreaterThan(0);
      expect(copy.a11y.openGuide.length).toBeGreaterThan(0);

      for (const status of PWA_INSTALL_STATUSES) {
        expect(copy.status[status].label.length).toBeGreaterThan(0);
        expect(copy.status[status].description.length).toBeGreaterThan(0);
      }

      for (const platform of PWA_INSTALL_PLATFORMS) {
        expect(copy.manualSteps[platform].label.length).toBeGreaterThan(0);
        expect(copy.manualSteps[platform].steps.length).toBeGreaterThanOrEqual(2);
        for (const step of copy.manualSteps[platform].steps) {
          expect(step.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('keeps Traditional Chinese, Simplified Chinese, Spanish, and English distinct', () => {
    expect(PWA_INSTALL_COPY.en.menu.title).toBe('Install this app');
    expect(PWA_INSTALL_COPY.zh.menu.title).toBe('安裝此應用程式');
    expect(PWA_INSTALL_COPY['zh-cn'].menu.title).toBe('安装此应用');
    expect(PWA_INSTALL_COPY.es.menu.title).toBe('Instalar esta aplicación');
  });

  it('explains that accepting a request is not confirmation of installation', () => {
    for (const language of languages) {
      const copy = getPwaInstallCopy(language);
      expect(copy.status.accepted.description).not.toBe(
        copy.status.standalone.description,
      );
      expect(copy.status.accepted.label).not.toBe(copy.status.standalone.label);
    }
  });
});
