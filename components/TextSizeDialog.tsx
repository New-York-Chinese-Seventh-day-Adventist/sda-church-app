import {
  DEFAULT_TEXT_SCALE,
  isTextScale,
  normalizeTextScale,
  scaleTypographyMetric,
  TEXT_SCALE_MAX,
  TEXT_SCALE_MIN,
  TEXT_SCALE_STEP,
  type TextScale,
} from '@/constants/AppPreferences';
import { LanguageContext } from '@/constants/LanguageContext';
import { useTextSize } from '@/constants/TextSizeContext';
import { createElement, useContext, useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

interface TextSizeDialogProps {
  onDismiss: () => void;
  visible: boolean;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export const TextSizeDialog = ({ onDismiss, visible }: TextSizeDialogProps) => {
  const { language } = useContext(LanguageContext);
  const { setTextScale, textScale } = useTextSize();
  const theme = useTheme();
  const englishOnly = language !== 'en';
  const [draftScale, setDraftScale] = useState<TextScale>(textScale);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (visible) {
      setDraftScale(textScale);
      setApplyError(null);
    }
  }, [textScale, visible]);

  const currentPercent = Math.round(draftScale * 100);
  const stepPercent = Math.round(TEXT_SCALE_STEP * 100);
  const progress = (draftScale - TEXT_SCALE_MIN) / (TEXT_SCALE_MAX - TEXT_SCALE_MIN);

  const setPercent = (percent: number) => {
    const snappedPercent = clamp(
      Math.round(percent / stepPercent) * stepPercent,
      TEXT_SCALE_MIN * 100,
      TEXT_SCALE_MAX * 100,
    );
    const nextScale = Number((snappedPercent / 100).toFixed(2));
    if (isTextScale(nextScale)) {
      setApplyError(null);
      setDraftScale(normalizeTextScale(nextScale));
    }
  };

  const adjustBySteps = (steps: number) =>
    setPercent(currentPercent + steps * stepPercent);

  const updateFromTouch = (event: GestureResponderEvent) => {
    if (isApplying || trackWidth <= 0) return;
    setPercent(
      (TEXT_SCALE_MIN +
        clamp(event.nativeEvent.locationX / trackWidth, 0, 1) *
          (TEXT_SCALE_MAX - TEXT_SCALE_MIN)) *
        100,
    );
  };

  const handleTrackLayout = (event: LayoutChangeEvent) =>
    setTrackWidth(event.nativeEvent.layout.width);

  const dismissWithoutApplying = () => {
    if (isApplying) return;
    setDraftScale(textScale);
    setApplyError(null);
    onDismiss();
  };

  const applyDraft = async () => {
    if (isApplying || !isTextScale(draftScale)) return;
    setIsApplying(true);
    setApplyError(null);
    try {
      await setTextScale(draftScale);
      onDismiss();
    } catch {
      setApplyError('Text size could not be saved. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleWebSliderKeyDown = (event: {
    key: string;
    preventDefault: () => void;
  }) => {
    const nextPercent = {
      ArrowDown: currentPercent - stepPercent,
      ArrowLeft: currentPercent - stepPercent,
      ArrowRight: currentPercent + stepPercent,
      ArrowUp: currentPercent + stepPercent,
      End: TEXT_SCALE_MAX * 100,
      Home: TEXT_SCALE_MIN * 100,
    }[event.key];
    if (nextPercent === undefined) return;
    event.preventDefault();
    setPercent(nextPercent);
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={dismissWithoutApplying}
        dismissable={!isApplying}
        dismissableBackButton={!isApplying}
        style={styles.dialog}
      >
        <Dialog.Title>{`Text size${englishOnly ? ' (English)' : ''}`}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {englishOnly && (
              <Text variant="labelMedium">
                This accessibility setting is currently described in English.
              </Text>
            )}
            <Text variant="bodyMedium" style={{ marginTop: englishOnly ? 12 : 0 }}>
              Adjust persistent app text from 100% to 200% in 5% steps.
            </Text>
            <Text
              variant="titleMedium"
              accessibilityLiveRegion="polite"
              style={styles.currentValue}
            >
              {`Current selection: ${currentPercent}%`}
            </Text>

            {Platform.OS === 'web'
              ? createElement('input', {
                  'aria-label': 'Text size',
                  'aria-valuemax': TEXT_SCALE_MAX * 100,
                  'aria-valuemin': TEXT_SCALE_MIN * 100,
                  'aria-valuenow': currentPercent,
                  'aria-valuetext': `${currentPercent} percent`,
                  disabled: isApplying,
                  max: TEXT_SCALE_MAX * 100,
                  min: TEXT_SCALE_MIN * 100,
                  onInput: (event: { currentTarget: { value: string } }) =>
                    setPercent(Number(event.currentTarget.value)),
                  onKeyDown: handleWebSliderKeyDown,
                  step: stepPercent,
                  style: {
                    accentColor: theme.colors.primary,
                    cursor: isApplying ? 'default' : 'pointer',
                    height: 44,
                    width: '100%',
                  },
                  type: 'range',
                  value: currentPercent,
                })
              : (
                  <View style={styles.nativeSliderRow}>
                    <Button
                      accessibilityLabel="Decrease text size by five percent"
                      compact
                      disabled={isApplying || draftScale === TEXT_SCALE_MIN}
                      onPress={() => adjustBySteps(-1)}
                    >
                      −5%
                    </Button>
                    <View
                      accessible
                      accessibilityActions={[
                        { name: 'increment', label: 'Increase text size' },
                        { name: 'decrement', label: 'Decrease text size' },
                      ]}
                      accessibilityLabel="Text size"
                      accessibilityRole="adjustable"
                      accessibilityValue={{
                        max: TEXT_SCALE_MAX * 100,
                        min: TEXT_SCALE_MIN * 100,
                        now: currentPercent,
                        text: `${currentPercent} percent`,
                      }}
                      focusable
                      onAccessibilityAction={(event) =>
                        adjustBySteps(event.nativeEvent.actionName === 'increment' ? 1 : -1)
                      }
                      onLayout={handleTrackLayout}
                      onMoveShouldSetResponder={() => !isApplying}
                      onResponderGrant={updateFromTouch}
                      onResponderMove={updateFromTouch}
                      onStartShouldSetResponder={() => !isApplying}
                      style={styles.nativeSlider}
                    >
                      <View
                        pointerEvents="none"
                        style={[
                          styles.nativeTrack,
                          { backgroundColor: theme.colors.surfaceVariant },
                        ]}
                      >
                        <View
                          style={[
                            styles.nativeTrackFill,
                            {
                              backgroundColor: theme.colors.primary,
                              width: `${progress * 100}%`,
                            },
                          ]}
                        />
                      </View>
                      <View
                        pointerEvents="none"
                        style={[
                          styles.nativeThumb,
                          {
                            backgroundColor: theme.colors.primary,
                            left: Math.max(0, trackWidth * progress - 10),
                          },
                        ]}
                      />
                    </View>
                    <Button
                      accessibilityLabel="Increase text size by five percent"
                      compact
                      disabled={isApplying || draftScale === TEXT_SCALE_MAX}
                      onPress={() => adjustBySteps(1)}
                    >
                      +5%
                    </Button>
                  </View>
                )}

            <View style={styles.rangeLabels} accessible={false}>
              <Text variant="labelMedium">100%</Text>
              <Text variant="labelMedium">200%</Text>
            </View>
            <View
              accessibilityLabel={`Text size preview at ${currentPercent} percent`}
              style={[
                styles.preview,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <Text variant="labelMedium" style={styles.previewLabel}>
                Live preview
              </Text>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: 'PlusJakartaSans-Regular',
                  fontSize: scaleTypographyMetric(16, draftScale),
                  lineHeight: scaleTypographyMetric(24, draftScale),
                }}
              >
                Welcome to NY Chinese SDA.
              </Text>
            </View>
            {applyError && (
              <Text
                accessibilityLiveRegion="assertive"
                role="alert"
                style={[styles.errorText, { color: theme.colors.error }]}
                variant="bodyMedium"
              >
                {applyError}
              </Text>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.actions}>
          <Button disabled={isApplying} onPress={dismissWithoutApplying}>
            Close
          </Button>
          <Button
            disabled={isApplying || draftScale === DEFAULT_TEXT_SCALE}
            onPress={() => setDraftScale(DEFAULT_TEXT_SCALE)}
          >
            Reset to 100%
          </Button>
          <Button
            mode="contained"
            disabled={isApplying || draftScale === textScale}
            loading={isApplying}
            onPress={() => void applyDraft()}
          >
            Apply
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexWrap: 'wrap',
  },
  currentValue: {
    marginTop: 20,
    textAlign: 'center',
  },
  dialog: {
    alignSelf: 'center',
    maxHeight: '90%',
    maxWidth: 560,
    width: '90%',
  },
  errorText: {
    marginTop: 12,
  },
  nativeSlider: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    minWidth: 100,
  },
  nativeSliderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  nativeThumb: {
    borderRadius: 10,
    height: 20,
    position: 'absolute',
    width: 20,
  },
  nativeTrack: {
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  nativeTrackFill: {
    height: '100%',
  },
  preview: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  previewLabel: {
    marginBottom: 8,
    opacity: 0.75,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});
