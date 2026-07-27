export type SabbathCountdownViewStatus = 'loading' | 'ready' | 'unavailable';
export type SabbathCountdownAccessibilityLocale = 'en' | 'zh' | 'zh-cn' | 'es';

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
  accessibilityLocale?: SabbathCountdownAccessibilityLocale;
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

const formatLocalizedCountdown = (
  values: Readonly<{ days: number; hours: number; minutes: number }>,
  locale: SabbathCountdownAccessibilityLocale,
) => {
  const { days, hours, minutes } = values;

  if (locale === 'zh' || locale === 'zh-cn') {
    const simplified = locale === 'zh-cn';
    const parts = [
      days > 0 ? `${days} 天` : null,
      hours > 0 ? `${hours} ${simplified ? '小时' : '小時'}` : null,
      minutes > 0 ? `${minutes} ${simplified ? '分钟' : '分鐘'}` : null,
    ].filter((part): part is string => part !== null);

    return parts.length > 0
      ? `${simplified ? '剩余' : '剩餘'} ${parts.join('、')}`
      : simplified
        ? '剩余不到一分钟'
        : '剩餘不到一分鐘';
  }

  if (locale === 'es') {
    const parts = [
      days > 0 ? `${days} ${days === 1 ? 'día' : 'días'}` : null,
      hours > 0 ? `${hours} ${hours === 1 ? 'hora' : 'horas'}` : null,
      minutes > 0 ? `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}` : null,
    ].filter((part): part is string => part !== null);
    const hasSingleUnit = parts.length === 1 && days + hours + minutes === 1;

    return parts.length > 0
      ? `${hasSingleUnit ? 'Falta' : 'Faltan'} ${parts.join(', ')}`
      : 'Falta menos de un minuto';
  }

  const parts = [
    days > 0 ? pluralize(days, 'day') : null,
    hours > 0 ? pluralize(hours, 'hour') : null,
    minutes > 0 ? pluralize(minutes, 'minute') : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0
    ? `${parts.join(', ')} remaining`
    : 'Less than one minute remaining';
};

/**
 * Screen readers get a stable, human-readable value that changes at most once per minute.
 * The visual countdown may continue to show seconds without becoming a live region.
 */
export function formatCountdownForAccessibility(
  countdown: string,
  locale: SabbathCountdownAccessibilityLocale = 'en',
): string {
  const match = COUNTDOWN_PATTERN.exec(countdown);
  if (!match) {
    if (locale === 'zh') return '無法取得倒數時間';
    if (locale === 'zh-cn') return '无法获取倒计时';
    if (locale === 'es') return 'Cuenta regresiva no disponible';
    return 'Countdown unavailable';
  }

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
    if (locale === 'zh') return '無法取得倒數時間';
    if (locale === 'zh-cn') return '无法获取倒计时';
    if (locale === 'es') return 'Cuenta regresiva no disponible';
    return 'Countdown unavailable';
  }

  return formatLocalizedCountdown({ days, hours, minutes }, locale);
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
      ? formatCountdownForAccessibility(
          input.countdown,
          input.accessibilityLocale,
        )
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
