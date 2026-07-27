const guidance = (platform, steps) =>
  Object.freeze({
    platform,
    steps: Object.freeze(steps),
  });

const GENERIC_GUIDANCE = guidance('this browser', [
  'Open the browser menu or share controls.',
  'Choose Install app or Add to Home Screen if it is offered.',
  'Review the app name and website address, then confirm. Browser wording can vary.',
]);

/**
 * Returns conservative English instructions without claiming an install capability that
 * the browser has not exposed. Browser and operating-system controls remain authoritative.
 */
export function resolvePwaInstallGuidance(userAgent = '', hints = {}) {
  const normalized = String(userAgent);
  const platform = typeof hints.platform === 'string' ? hints.platform : '';
  const maxTouchPoints = Number.isFinite(hints.maxTouchPoints)
    ? hints.maxTouchPoints
    : 0;
  const brands = Array.isArray(hints.brands) ? hints.brands : [];
  const isIos =
    /iPad|iPhone|iPod/i.test(normalized) ||
    (platform === 'MacIntel' && maxTouchPoints > 1);
  const isAndroid = /Android/i.test(normalized);
  const isEdge = /Edg(?:A|iOS)?\//i.test(normalized);
  const isFirefox = /Firefox|FxiOS/i.test(normalized);
  const isGoogleChrome = brands.length
    ? brands.some(({ brand }) => brand === 'Google Chrome')
    : /Chrome\//i.test(normalized) &&
      !/(?:EdgA|OPR|SamsungBrowser|YaBrowser|DuckDuckGo)\//i.test(normalized);
  const isChromium = /Chrome|Chromium|CriOS/i.test(normalized) && !isEdge;
  const isSafari =
    /Safari/i.test(normalized) &&
    !/Chrome|CriOS|Chromium|Edg|Firefox|FxiOS/i.test(normalized);
  const isMac = /Macintosh|Mac OS X/i.test(normalized);
  const isWindows = /Windows NT/i.test(normalized);

  if (isIos) {
    return guidance('iPhone or iPad', [
      'Open this page in Safari if your current browser does not show a home-screen action.',
      "Tap Safari's Share button, then choose Add to Home Screen. It may appear under More or Edit Actions.",
      'Turn on Open as Web App, review the app name and website address, then tap Add.',
    ]);
  }

  if (isAndroid && (isGoogleChrome || isEdge)) {
    return guidance(isEdge ? 'Microsoft Edge on Android' : 'Chrome on Android', [
      "Open the browser's three-dot menu.",
      'Choose Add to home screen, then Install, if those actions are offered.',
      'Review the app name and website address, then confirm.',
    ]);
  }

  if (isAndroid && isFirefox) {
    return guidance('Firefox on Android', [
      "Open the browser's three-dot menu.",
      'Choose Install or Add to Home screen if it is offered.',
      'Review the app name and website address, then confirm.',
    ]);
  }

  if (isAndroid) {
    return guidance('this Android browser', [
      "Open the browser's menu.",
      'Choose Install app or Add to Home screen only if that action is offered.',
      'Review the app name and website address, then confirm.',
    ]);
  }

  if (isMac && isSafari) {
    return guidance('Safari on Mac', [
      "Use Safari's Share button in the toolbar.",
      'Choose Add to Dock if that action is available in your macOS version.',
      'Review the app name and website address, then confirm.',
    ]);
  }

  if (isGoogleChrome || isEdge) {
    return guidance(isEdge ? 'Microsoft Edge' : 'Chrome', [
      'Use the install icon in the address bar, if shown, or open the browser menu.',
      'Choose Install this site as an app or Install app. Wording varies by browser version.',
      'Review the app name and website address, then confirm.',
    ]);
  }

  if (isChromium) {
    return guidance('this Chromium-based browser', [
      'Use an install icon in the address bar, if shown, or open the browser menu.',
      'Choose an install or app action only if the browser offers one.',
      'Review the app name and website address, then confirm.',
    ]);
  }

  if (isFirefox && isWindows) {
    return guidance('Firefox on Windows', [
      'Use the web apps button in the address bar if Firefox offers it for this page.',
      'Firefox adds the web app to the Windows taskbar and Start menu.',
      'Only proceed if the browser shows the expected website address.',
    ]);
  }

  if (isFirefox) {
    return guidance('Firefox on this desktop', [
      'Firefox currently offers its desktop web-app feature only on Windows.',
      'You can bookmark this page, or open the same address in a browser that offers an install action on this platform.',
      'Only proceed if the browser shows the expected website address.',
    ]);
  }

  return GENERIC_GUIDANCE;
}
