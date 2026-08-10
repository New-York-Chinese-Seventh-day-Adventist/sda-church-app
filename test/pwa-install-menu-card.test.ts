import { PwaInstallMenuCard } from '@/components/PwaInstallMenuCard';
import { PwaInstallContext } from '@/constants/PwaInstallContext';
import { getPwaInstallCopy } from '@/constants/PwaInstallCopy';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { createElement } from 'react';
import { renderWithPreferences } from './helpers/render-preferences';

describe('persistent You-tab PWA installation guidance', () => {
  it('keeps the localized entry available after its guide is closed', async () => {
    const copy = getPwaInstallCopy('zh');
    const screen = renderWithPreferences(
      createElement(
        PwaInstallContext.Provider,
        {
          value: {
            platform: 'ios-safari',
            requestInstall: jest.fn().mockResolvedValue('unavailable'),
            status: 'unavailable',
          },
        },
        createElement(PwaInstallMenuCard, { isWeb: true }),
      ),
      { language: 'zh' },
    );
    const menuEntry = screen.getByRole('button', {
      name: `${copy.menu.title}. ${copy.menu.description}`,
    });

    fireEvent.press(menuEntry);
    expect(screen.getByLabelText(copy.a11y.dialog)).toBeTruthy();
    expect(screen.getByText(copy.manualSteps['ios-safari'].label)).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: copy.a11y.close }));
    await waitFor(() => {
      expect(screen.queryByLabelText(copy.a11y.dialog)).toBeNull();
    });
    expect(
      screen.getByRole('button', {
        name: `${copy.menu.title}. ${copy.menu.description}`,
      }),
    ).toBeTruthy();
  });

  it('does not expose web installation guidance in the native app', () => {
    const copy = getPwaInstallCopy('en');
    const screen = renderWithPreferences(
      createElement(PwaInstallMenuCard, { isWeb: false }),
    );

    expect(screen.queryByText(copy.menu.title)).toBeNull();
  });
});
