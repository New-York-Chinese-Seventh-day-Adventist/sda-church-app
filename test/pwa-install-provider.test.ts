import {
  PwaInstallProvider,
  type PwaInstallRuntime,
} from '@/components/PwaInstallProvider';
import { usePwaInstall } from '@/constants/PwaInstallContext';
import type {
  BeforeInstallPromptEvent,
  BrowserSnapshot,
} from '@/services/PwaInstallGuidance';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { createElement } from 'react';
import { Pressable, Text, View } from 'react-native';

type InstallEventName = 'appinstalled' | 'beforeinstallprompt';
type InstallEventListener = (event: Event) => void;

class FakePwaInstallRuntime implements PwaInstallRuntime {
  private readonly listeners = new Map<
    InstallEventName,
    Set<InstallEventListener>
  >();

  constructor(
    readonly isWeb: boolean,
    private readonly snapshot: BrowserSnapshot,
  ) {}

  addEventListener = (type: InstallEventName, listener: InstallEventListener) => {
    const listeners = this.listeners.get(type) ?? new Set<InstallEventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  };

  removeEventListener = (
    type: InstallEventName,
    listener: InstallEventListener,
  ) => {
    this.listeners.get(type)?.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  dispatch(type: InstallEventName, event: Event) {
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }

  listenerCount(type: InstallEventName) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

const InstallStateProbe = () => {
  const { platform, requestInstall, status } = usePwaInstall();

  return createElement(
    View,
    null,
    createElement(Text, { testID: 'install-status' }, status),
    createElement(Text, { testID: 'install-platform' }, platform),
    createElement(
      Pressable,
      {
        accessibilityRole: 'button',
        onPress: () => void requestInstall(),
      },
      createElement(Text, null, 'Request install'),
    ),
  );
};

const renderProvider = (runtime: PwaInstallRuntime) =>
  render(
    createElement(
      PwaInstallProvider,
      { runtime },
      createElement(InstallStateProbe),
    ),
  );

const makePromptEvent = (
  outcome: 'accepted' | 'dismissed',
  prompt: () => Promise<void> = async () => {},
) =>
  ({
    preventDefault: jest.fn(),
    prompt: jest.fn(prompt),
    userChoice: Promise.resolve({ outcome }),
  }) as unknown as BeforeInstallPromptEvent & Event;

describe('PwaInstallProvider', () => {
  it('reports installation as not applicable outside the web app', () => {
    const runtime = new FakePwaInstallRuntime(false, { userAgent: '' });
    const screen = renderProvider(runtime);

    expect(screen.getByTestId('install-status').props.children).toBe(
      'not-applicable',
    );
  });

  it('keeps an accepted request distinct from confirmed installation', async () => {
    const runtime = new FakePwaInstallRuntime(true, {
      userAgent:
        'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/132.0 Mobile Safari/537.36',
    });
    const screen = renderProvider(runtime);
    const promptEvent = makePromptEvent('accepted');

    act(() => runtime.dispatch('beforeinstallprompt', promptEvent));
    expect(promptEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('install-status').props.children).toBe(
      'prompt-available',
    );

    fireEvent.press(screen.getByRole('button', { name: 'Request install' }));
    await waitFor(() => {
      expect(screen.getByTestId('install-status').props.children).toBe('accepted');
    });

    act(() => runtime.dispatch('appinstalled', {} as Event));
    expect(screen.getByTestId('install-status').props.children).toBe('standalone');

    const latePrompt = makePromptEvent('accepted');
    act(() => runtime.dispatch('beforeinstallprompt', latePrompt));
    expect(latePrompt.preventDefault).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('install-status').props.children).toBe('standalone');
  });

  it('does not let a late browser choice overwrite appinstalled', async () => {
    const runtime = new FakePwaInstallRuntime(true, {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/132.0 Safari/537.36',
    });
    const screen = renderProvider(runtime);
    let resolveChoice:
      | ((choice: { outcome: 'accepted' }) => void)
      | undefined;
    const promptEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn(async () => {}),
      userChoice: new Promise<{ outcome: 'accepted' }>((resolve) => {
        resolveChoice = resolve;
      }),
    } as unknown as BeforeInstallPromptEvent & Event;

    act(() => runtime.dispatch('beforeinstallprompt', promptEvent));
    fireEvent.press(screen.getByRole('button', { name: 'Request install' }));
    act(() => runtime.dispatch('appinstalled', {} as Event));
    expect(screen.getByTestId('install-status').props.children).toBe('standalone');

    await act(async () => {
      resolveChoice?.({ outcome: 'accepted' });
    });
    expect(screen.getByTestId('install-status').props.children).toBe('standalone');
  });

  it('surfaces dismissed and failed browser prompt outcomes', async () => {
    const runtime = new FakePwaInstallRuntime(true, {
      userAgent: 'Mozilla/5.0 Firefox/141.0',
    });
    const screen = renderProvider(runtime);

    act(() =>
      runtime.dispatch('beforeinstallprompt', makePromptEvent('dismissed')),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Request install' }));
    await waitFor(() => {
      expect(screen.getByTestId('install-status').props.children).toBe('dismissed');
    });

    act(() =>
      runtime.dispatch(
        'beforeinstallprompt',
        makePromptEvent('accepted', async () => {
          throw new Error('browser prompt failed');
        }),
      ),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Request install' }));
    await waitFor(() => {
      expect(screen.getByTestId('install-status').props.children).toBe('error');
    });
  });

  it('detects iOS Safari and removes browser listeners on unmount', () => {
    const runtime = new FakePwaInstallRuntime(true, {
      platform: 'iPhone',
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
    });
    const screen = renderProvider(runtime);

    expect(screen.getByTestId('install-platform').props.children).toBe(
      'ios-safari',
    );
    expect(runtime.listenerCount('beforeinstallprompt')).toBe(1);
    expect(runtime.listenerCount('appinstalled')).toBe(1);

    screen.unmount();
    expect(runtime.listenerCount('beforeinstallprompt')).toBe(0);
    expect(runtime.listenerCount('appinstalled')).toBe(0);
  });
});
