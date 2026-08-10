import { PwaInstallDialog } from '@/components/PwaInstallDialog';
import { getPwaInstallCopy } from '@/constants/PwaInstallCopy';
import type { PwaInstallStatus } from '@/services/PwaInstallGuidance';
import { act, fireEvent } from '@testing-library/react-native';
import { createElement } from 'react';
import { renderWithPreferences } from './helpers/render-preferences';

describe('PwaInstallDialog', () => {
  it('renders localized status and manual steps and invokes the browser install request', async () => {
    const copy = getPwaInstallCopy('en');
    const onDismiss = jest.fn();
    const onInstall = jest.fn();
    const screen = renderWithPreferences(
      createElement(PwaInstallDialog, {
        onDismiss,
        onInstall,
        platform: 'android-chrome',
        status: 'prompt-available',
        visible: true,
      }),
    );

    expect(screen.getByLabelText(copy.a11y.dialog)).toBeTruthy();
    expect(
      screen.getByRole('header', { name: copy.dialog.title }),
    ).toBeTruthy();
    expect(screen.getByText(copy.dialog.description)).toBeTruthy();
    expect(screen.getByText(copy.status['prompt-available'].label)).toBeTruthy();
    expect(
      screen.getByText(copy.status['prompt-available'].description),
    ).toBeTruthy();
    expect(screen.getByText(copy.dialog.manualStepsHeading)).toBeTruthy();
    expect(screen.getByText(copy.manualSteps['android-chrome'].label)).toBeTruthy();
    for (const step of copy.manualSteps['android-chrome'].steps) {
      expect(screen.getByText(step)).toBeTruthy();
    }

    await act(async () => {
      fireEvent.press(
        screen.getByRole('button', { name: copy.a11y.install }),
      );
    });
    expect(onInstall).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByRole('button', { name: copy.a11y.close }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it.each<PwaInstallStatus>([
    'accepted',
    'dismissed',
    'error',
    'not-applicable',
    'standalone',
    'unavailable',
  ])('does not offer the install action for %s status', (status) => {
    const copy = getPwaInstallCopy('en');
    const screen = renderWithPreferences(
      createElement(PwaInstallDialog, {
        onDismiss: jest.fn(),
        onInstall: jest.fn(),
        platform: 'generic',
        status,
        visible: true,
      }),
    );

    expect(screen.getByText(copy.status[status].description)).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: copy.a11y.install }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: copy.a11y.close }),
    ).toBeTruthy();
  });

  it('uses complete Spanish copy and accessible action names', () => {
    const copy = getPwaInstallCopy('es');
    const onDismiss = jest.fn();
    const screen = renderWithPreferences(
      createElement(PwaInstallDialog, {
        onDismiss,
        onInstall: jest.fn(),
        platform: 'ios-safari',
        status: 'dismissed',
        visible: true,
      }),
      { language: 'es' },
    );

    expect(screen.getByLabelText(copy.a11y.dialog)).toBeTruthy();
    expect(screen.getByText(copy.dialog.title)).toBeTruthy();
    expect(screen.getByText(copy.status.dismissed.label)).toBeTruthy();
    expect(screen.getByText(copy.manualSteps['ios-safari'].label)).toBeTruthy();
    for (const step of copy.manualSteps['ios-safari'].steps) {
      expect(screen.getByText(step)).toBeTruthy();
    }

    fireEvent.press(screen.getByRole('button', { name: copy.a11y.close }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('prevents repeated install requests while an async request is pending', async () => {
    let finishInstall: (() => void) | undefined;
    const onInstall = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishInstall = resolve;
        }),
    );
    const copy = getPwaInstallCopy('en');
    const screen = renderWithPreferences(
      createElement(PwaInstallDialog, {
        onDismiss: jest.fn(),
        onInstall,
        platform: 'desktop-chrome',
        status: 'prompt-available',
        visible: true,
      }),
    );
    const installButton = screen.getByRole('button', {
      name: copy.a11y.install,
    });

    fireEvent.press(installButton);
    fireEvent.press(installButton);
    expect(onInstall).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', {
        disabled: true,
        name: copy.a11y.install,
      }),
    ).toBeTruthy();

    await act(async () => {
      finishInstall?.();
    });
  });

  it('hides unnecessary manual steps once the app is installed', () => {
    const copy = getPwaInstallCopy('zh-cn');
    const screen = renderWithPreferences(
      createElement(PwaInstallDialog, {
        onDismiss: jest.fn(),
        onInstall: jest.fn(),
        platform: 'desktop-edge',
        status: 'standalone',
        visible: true,
      }),
      { language: 'zh-cn' },
    );

    expect(screen.getByText(copy.status.standalone.description)).toBeTruthy();
    expect(screen.queryByText(copy.dialog.manualStepsHeading)).toBeNull();
    expect(
      screen.queryByText(copy.manualSteps['desktop-edge'].label),
    ).toBeNull();
  });
});
