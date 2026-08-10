import {
  IOS_PWA_INSTALL_GUIDE_ERROR_COPY,
  IOS_PWA_INSTALL_GUIDE_URL,
  openIosPwaInstallGuide,
} from '@/constants/ExternalLinks';
import { Alert, Linking } from 'react-native';

describe('localized first-run iOS guide handoff', () => {
  it.each(['en', 'zh', 'zh-cn', 'es'] as const)(
    'shows a localized %s error if the existing guide cannot open',
    async (language) => {
      jest
        .spyOn(Linking, 'openURL')
        .mockRejectedValueOnce(new Error('link unavailable'));
      const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await openIosPwaInstallGuide(language);

      expect(alert).toHaveBeenCalledWith(
        IOS_PWA_INSTALL_GUIDE_ERROR_COPY[language].title,
        IOS_PWA_INSTALL_GUIDE_ERROR_COPY[language].message,
      );
    },
  );

  it('retains the existing guide for the separate issue #137 handoff', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);

    await openIosPwaInstallGuide('en');

    expect(open).toHaveBeenCalledWith(IOS_PWA_INSTALL_GUIDE_URL);
  });
});
