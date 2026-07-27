import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import {
  createLocalBackup,
  deleteBackedUpLocalSettings,
  MAX_BACKUP_BYTES,
  parseLocalBackup,
  readCurrentBackupSettings,
  restoreLocalBackup,
  serializeLocalBackup,
} from '@/services/LocalBackup';
import type { LocalBackupEnvelope } from '@/services/LocalBackup';
import { NavigationStyles } from '@/styles/NavigationStyles';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button, Card, Dialog, Divider, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BusyAction = 'export' | 'import' | 'restore' | 'delete' | null;
type StatusMessage = { kind: 'success' | 'error'; text: string } | null;

const LANGUAGE_NAMES = {
  en: 'English',
  zh: 'Traditional Chinese',
  'zh-cn': 'Simplified Chinese',
  es: 'Spanish',
} as const;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The backup operation failed.';
}

function downloadJson(text: string, createdAt: string): void {
  if (
    typeof document === 'undefined' ||
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined'
  ) {
    throw new Error('File downloads are unavailable in this browser.');
  }

  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `nyccsda-settings-${createdAt.slice(0, 10)}.json`;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}

function selectJsonFile(onSelect: (file: File) => void): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('File selection is unavailable in this browser.');
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.style.display = 'none';
  input.setAttribute('aria-hidden', 'true');

  let handled = false;
  const cleanup = () => {
    window.removeEventListener('focus', handleFocus);
    input.remove();
  };
  const handleFocus = () => {
    window.setTimeout(() => {
      if (!handled) cleanup();
    }, 500);
  };

  input.addEventListener(
    'change',
    () => {
      handled = true;
      const file = input.files?.[0];
      cleanup();
      if (file) onSelect(file);
    },
    { once: true },
  );
  window.addEventListener('focus', handleFocus, { once: true });
  document.body.appendChild(input);
  input.click();
}

export default function BackupScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const { backTo } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { fontScale, width } = useWindowDimensions();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;
  const [busy, setBusy] = useState<BusyAction>(null);
  const [preview, setPreview] = useState<LocalBackupEnvelope | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [reloadNeeded, setReloadNeeded] = useState(false);
  const isWeb = Platform.OS === 'web';
  const stackDialogActions = width < 480 || fontScale > 1.25;

  const handleExport = async () => {
    setBusy('export');
    setStatus(null);
    try {
      const settings = await readCurrentBackupSettings(language, theme.dark);
      const envelope = await createLocalBackup(settings);
      downloadJson(serializeLocalBackup(envelope), envelope.createdAt);
      setStatus({
        kind: 'success',
        text: 'Backup download started. Keep the plain JSON file in a private location.',
      });
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error) });
    } finally {
      setBusy(null);
    }
  };

  const inspectFile = async (file: File) => {
    setBusy('import');
    setStatus(null);
    try {
      if (file.size > MAX_BACKUP_BYTES) {
        throw new Error(`Backup file exceeds the ${MAX_BACKUP_BYTES}-byte limit.`);
      }
      setPreview(await parseLocalBackup(await file.text()));
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error) });
    } finally {
      setBusy(null);
    }
  };

  const handleChooseFile = () => {
    setStatus(null);
    try {
      selectJsonFile((file) => void inspectFile(file));
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error) });
    }
  };

  const handleRestore = async () => {
    if (!preview) return;
    setBusy('restore');
    setStatus(null);
    try {
      await restoreLocalBackup(preview.data);
      setPreview(null);
      setReloadNeeded(true);
      setStatus({
        kind: 'success',
        text: 'Restore complete. Reload the app to apply the restored settings.',
      });
    } catch (error) {
      setPreview(null);
      setStatus({ kind: 'error', text: errorMessage(error) });
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    setBusy('delete');
    setStatus(null);
    try {
      await deleteBackedUpLocalSettings();
      setReloadNeeded(true);
      setStatus({
        kind: 'success',
        text: 'Language, theme, text size, and setup settings were deleted. Reload to return to setup.',
      });
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error) });
    } finally {
      setDeleteDialogVisible(false);
      setBusy(null);
    }
  };

  const reload = () => {
    if (isWeb && typeof window !== 'undefined') window.location.reload();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Backup & Restore', backTo } as any} />
      <ScrollView
        style={[NavigationStyles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          NavigationStyles.contentContainer,
          styles.content,
          { paddingBottom: insets.bottom + 80, paddingTop: headerHeight + 20 },
        ]}
      >
        {language !== 'en' ? (
          <Card mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                This backup screen is currently provided in English only.
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Local settings backup
        </Text>
        <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
          Download a portable JSON file directly to your device. The app does not create an
          account, upload the file, or connect to a cloud-storage service.
        </Text>

        <Card mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Version 2 scope
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Included: language, light/dark theme, text size, and setup completion.
            </Text>
            <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
              Checksum-valid version 1 files remain supported and are migrated only after
              their original checksum is verified.
            </Text>
            <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
              Excluded: Bible translation and reading position, saved verses, content
              caches, notes, prayer, schedules, accounts, and all unknown or future data.
            </Text>
            <Text variant="bodySmall" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
              The SHA-256 checksum detects accidental changes; it does not identify who
              created the plain JSON file. Review the preview before restoring.
            </Text>
          </Card.Content>
        </Card>

        {!isWeb ? (
          <Card mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                Unavailable on this platform
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Local JSON backup and restore is currently available only in the web app.
                No native backup was performed.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <View style={styles.buttonGroup}>
              <Button
                disabled={busy !== null}
                icon="download"
                loading={busy === 'export'}
                mode="contained"
                onPress={() => void handleExport()}
              >
                Download backup JSON
              </Button>
              <Button
                disabled={busy !== null}
                icon="file-upload-outline"
                loading={busy === 'import'}
                mode="outlined"
                onPress={handleChooseFile}
              >
                Choose backup JSON
              </Button>
            </View>

            {status ? (
              <Card
                mode="outlined"
                style={[
                  styles.statusCard,
                  {
                    backgroundColor:
                      status.kind === 'error'
                        ? theme.colors.errorContainer
                        : theme.colors.primaryContainer,
                  },
                ]}
              >
                <Card.Content>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color:
                        status.kind === 'error'
                          ? theme.colors.onErrorContainer
                          : theme.colors.onPrimaryContainer,
                    }}
                  >
                    {status.text}
                  </Text>
                  {reloadNeeded ? (
                    <Button icon="reload" mode="text" onPress={reload} style={styles.reloadButton}>
                      Reload app
                    </Button>
                  ) : null}
                </Card.Content>
              </Card>
            ) : null}

            <Divider style={styles.divider} />
            <Text variant="titleMedium" style={[styles.dangerTitle, { color: theme.colors.error }]}>
              Delete backed-up local settings
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              This deletes only language, theme, setup completion, and text size from this
              browser. Bible settings, saved verses, caches, and downloaded files remain.
            </Text>
            <Button
              disabled={busy !== null}
              icon="delete-outline"
              mode="outlined"
              onPress={() => setDeleteDialogVisible(true)}
              style={[styles.deleteButton, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
            >
              Delete local settings
            </Button>
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={preview !== null}
          onDismiss={() => busy === null && setPreview(null)}
          style={styles.dialog}
        >
          <Dialog.Title>Restore preview</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              <Text variant="titleSmall">Checksum verified</Text>
              <Text variant="bodyMedium" style={styles.previewLine}>
                Created: {preview ? new Date(preview.createdAt).toLocaleString() : ''}
              </Text>
              <Text variant="bodyMedium" style={styles.previewLine}>
                Language: {preview ? LANGUAGE_NAMES[preview.data.language] : ''}
              </Text>
              <Text variant="bodyMedium" style={styles.previewLine}>
                Theme: {preview?.data.theme === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <Text variant="bodyMedium" style={styles.previewLine}>
                Setup complete: {preview?.data.setupComplete ? 'Yes' : 'No'}
              </Text>
              <Text variant="bodyMedium" style={styles.previewLine}>
                Text size: {preview ? `${Math.round(preview.data.textScale * 100)}%` : ''}
              </Text>
              <Text variant="bodySmall" style={styles.previewNotice}>
                Restoring replaces only these four local settings. No other stored keys are
                read, changed, or deleted.
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={[styles.dialogActions, stackDialogActions && styles.dialogActionsStacked]}>
            <Button
              disabled={busy !== null}
              onPress={() => setPreview(null)}
              style={stackDialogActions ? styles.dialogActionFullWidth : undefined}
            >
              Cancel
            </Button>
            <Button
              accessibilityLabel="Restore these settings"
              disabled={busy !== null}
              loading={busy === 'restore'}
              onPress={() => void handleRestore()}
              style={stackDialogActions ? styles.dialogActionFullWidth : undefined}
            >
              {stackDialogActions ? 'Restore' : 'Restore these settings'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => busy === null && setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Delete local settings?</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              <Text variant="bodyMedium">
                This permanently removes language, theme, text size, and setup completion
                from this browser. Bible preferences, saved verses, caches, and existing
                backup files are not deleted. The setup screen returns after reload.
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={[styles.dialogActions, stackDialogActions && styles.dialogActionsStacked]}>
            <Button
              disabled={busy !== null}
              onPress={() => setDeleteDialogVisible(false)}
              style={stackDialogActions ? styles.dialogActionFullWidth : undefined}
            >
              Cancel
            </Button>
            <Button
              accessibilityLabel="Delete settings"
              disabled={busy !== null}
              loading={busy === 'delete'}
              onPress={() => void handleDelete()}
              style={stackDialogActions ? styles.dialogActionFullWidth : undefined}
              textColor={theme.colors.error}
            >
              {stackDialogActions ? 'Delete' : 'Delete settings'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    maxWidth: 760,
    width: '100%',
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  intro: {
    lineHeight: 21,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  paragraph: {
    lineHeight: 20,
    marginTop: 8,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  reloadButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  divider: {
    marginVertical: 20,
  },
  dangerTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  deleteButton: {
    marginBottom: 32,
    marginTop: 16,
  },
  dialog: {
    alignSelf: 'center',
    maxHeight: '90%',
    maxWidth: 560,
    width: '90%',
  },
  dialogScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  dialogActions: {
    flexWrap: 'wrap',
  },
  dialogActionsStacked: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  dialogActionFullWidth: {
    marginHorizontal: 0,
    width: '100%',
  },
  previewLine: {
    marginTop: 8,
  },
  previewNotice: {
    lineHeight: 18,
    marginTop: 16,
  },
});
