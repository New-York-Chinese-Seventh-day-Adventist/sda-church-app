export const TEXT_SCALE_STORAGE_KEY = 'user-text-scale';
export const TEXT_SCALE_MIN = 1;
export const TEXT_SCALE_MAX = 2;
export const TEXT_SCALE_STEP = 0.05;
export const TEXT_SCALE_OPTIONS = Object.freeze([1, 1.25, 1.5]);
export const DEFAULT_TEXT_SCALE = 1;

// Native gesture math can introduce small floating-point errors. Accept only
// representation noise around an exact 5% step, then normalize the value.
const TEXT_SCALE_EPSILON = 1e-6;

const snapTextScale = (value) => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < TEXT_SCALE_MIN - TEXT_SCALE_EPSILON ||
    value > TEXT_SCALE_MAX + TEXT_SCALE_EPSILON
  ) {
    return null;
  }

  const stepIndex = Math.round((value - TEXT_SCALE_MIN) / TEXT_SCALE_STEP);
  const snapped = Number(
    (TEXT_SCALE_MIN + stepIndex * TEXT_SCALE_STEP).toFixed(2),
  );
  return Math.abs(value - snapped) <= TEXT_SCALE_EPSILON ? snapped : null;
};

export const isTextScale = (value) => snapTextScale(value) !== null;

export const normalizeTextScale = (value) =>
  snapTextScale(value) ?? DEFAULT_TEXT_SCALE;

export const parseStoredTextScale = (value) => {
  if (value === null || value.trim() === '') return DEFAULT_TEXT_SCALE;
  return normalizeTextScale(Number(value));
};

export const serializeTextScale = (value) => {
  const normalized = snapTextScale(value);
  if (normalized === null) {
    throw new TypeError('Text scale must be between 100% and 200% in 5% steps.');
  }
  return String(normalized);
};

export const scaleTypographyMetric = (value, scale) =>
  Math.round(value * scale * 100) / 100;

export const scaleTypographyRecord = (variants, scale) =>
  Object.fromEntries(
    Object.entries(variants).map(([name, variant]) => [
      name,
      {
        ...variant,
        ...(typeof variant.fontSize === 'number'
          ? { fontSize: scaleTypographyMetric(variant.fontSize, scale) }
          : {}),
        ...(typeof variant.lineHeight === 'number'
          ? { lineHeight: scaleTypographyMetric(variant.lineHeight, scale) }
          : {}),
      },
    ]),
  );
