export type SabbathCountdownViewStatus = 'loading' | 'ready' | 'unavailable';

export type SabbathCountdownViewLabels = Readonly<{
  starts: string;
  ends: string;
  loading: string;
  unavailable: string;
  openDetailsHint: string;
}>;

export type SabbathCountdownViewInput = Readonly<{
  status: SabbathCountdownViewStatus;
  isSabbath: boolean;
  countdown: string;
  dateLabel: string | null;
  locationLabel: string;
  labels: SabbathCountdownViewLabels;
}>;

export type SabbathCountdownViewModel = Readonly<{
  title: string;
  countdownText: string;
  secondaryText: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  canRetryProvider: boolean;
}>;

const COUNTDOWN_PATTERN = /^(?:(\d+)d )?(\d{2}):(\d{2}):(\d{2})$/;

const pluralize = (value: number, unit: string) =>
  `${value} ${unit}${value === 1 ? '' : 's'}`;

/**
 * Screen readers get a stable, human-readable value that changes at most once per minute.
 * The visual countdown may continue to show seconds without becoming a live region.
 */
export function formatCountdownForAccessibility(countdown: string): string {
  const match = COUNTDOWN_PATTERN.exec(countdown);
  if (!match) return 'Countdown unavailable';

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  const seconds = Number(match[4]);
  if (
    !Number.isSafeInteger(days) ||
    hours > 23 ||
    minutes > 59 ||
    seconds > 59
  ) {
    return 'Countdown unavailable';
  }

  const parts = [
    days > 0 ? pluralize(days, 'day') : null,
    hours > 0 ? pluralize(hours, 'hour') : null,
    minutes > 0 ? pluralize(minutes, 'minute') : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? `${parts.join(', ')} remaining` : 'Less than one minute remaining';
}

export function createSabbathCountdownViewModel(
  input: SabbathCountdownViewInput,
): SabbathCountdownViewModel {
  const title =
    input.status === 'loading'
      ? input.labels.loading
      : input.status === 'unavailable'
        ? input.labels.unavailable
        : input.isSabbath
          ? input.labels.ends
          : input.labels.starts;
  const countdownText = input.status === 'ready' ? input.countdown : '—';
  const secondaryText =
    input.status === 'ready' && input.dateLabel
      ? `${input.dateLabel} · ${input.locationLabel}`
      : input.locationLabel;
  const remaining =
    input.status === 'ready'
      ? formatCountdownForAccessibility(input.countdown)
      : null;
  const accessibilityLabel = [
    title,
    remaining,
    secondaryText,
  ]
    .filter((part): part is string => Boolean(part))
    .join('. ');

  return Object.freeze({
    title,
    countdownText,
    secondaryText,
    accessibilityLabel,
    accessibilityHint: input.labels.openDetailsHint,
    canRetryProvider: input.status === 'unavailable',
  });
}
