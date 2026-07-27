export interface PwaInstallGuidance {
  platform: string;
  steps: readonly string[];
}

export interface PwaInstallNavigatorHints {
  platform?: string;
  maxTouchPoints?: number;
  brands?: readonly { brand: string }[];
}

export function resolvePwaInstallGuidance(
  userAgent?: string,
  hints?: PwaInstallNavigatorHints,
): PwaInstallGuidance;
