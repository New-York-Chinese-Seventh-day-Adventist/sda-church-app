import { InstallPrompt } from '@/components/InstallPrompt';
import { fireEvent } from '@testing-library/react-native';
import { createElement } from 'react';
import { renderWithPreferences } from './helpers/render-preferences';

const localizedCases = [
  {
    language: 'en' as const,
    title: 'Install the app',
    install: 'Install the church app',
    later: 'Continue without installing',
    dialog: 'Install app prompt',
  },
  {
    language: 'zh' as const,
    title: '安裝應用程式',
    install: '安裝教會應用程式',
    later: '暫時不安裝並繼續',
    dialog: '安裝應用程式提示',
  },
  {
    language: 'zh-cn' as const,
    title: '安装应用',
    install: '安装教会应用',
    later: '暂不安装并继续',
    dialog: '安装应用提示',
  },
  {
    language: 'es' as const,
    title: 'Instalar la aplicación',
    install: 'Instalar la aplicación de la iglesia',
    later: 'Continuar sin instalar',
    dialog: 'Solicitud para instalar la aplicación',
  },
];

describe('first-run install prompt', () => {
  it.each(localizedCases)(
    'renders wrapping, accessible $language actions at 200% app text',
    ({ dialog, install, language, later, title }) => {
      const screen = renderWithPreferences(
        createElement(InstallPrompt, {
          onDismiss: jest.fn(),
          onInstall: jest.fn().mockResolvedValue(undefined),
        }),
        { language, textScale: 2 },
      );

      expect(screen.getByLabelText(dialog)).toBeTruthy();
      expect(screen.getByRole('header', { name: title })).toBeTruthy();
      expect(screen.getByRole('button', { name: install })).toBeTruthy();
      expect(screen.getByRole('button', { name: later })).toBeTruthy();
    },
  );

  it('keeps install and continue-without-installing actions distinct', () => {
    const onDismiss = jest.fn();
    const onInstall = jest.fn().mockResolvedValue(undefined);
    const screen = renderWithPreferences(
      createElement(InstallPrompt, { onDismiss, onInstall }),
    );

    fireEvent.press(
      screen.getByRole('button', { name: 'Install the church app' }),
    );
    expect(onInstall).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.press(
      screen.getByRole('button', { name: 'Continue without installing' }),
    );
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
