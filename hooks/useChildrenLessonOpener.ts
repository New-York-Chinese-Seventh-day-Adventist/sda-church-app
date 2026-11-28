import { LINK_ERROR_MESSAGE, openCurrentChildrenSabbathSchool, openURL } from '@/constants/ExternalLinks';
import type { SupportedLanguage } from '@/constants/LanguageContext';
import {
  isChildrenLessonPdf,
  type ChildrenSabbathSchoolCurriculum,
} from '@/features/sabbath-school/ChildrenLessons';
import {
  getChildrenLesson,
  previewChildrenLesson,
  type LessonDownloadProgress,
} from '@/features/sabbath-school/LessonDownloads';
import { recordForScreenshot } from '@/services/ScreenshotRoute';
import { useAfterSheetCloses } from '@/hooks/useAfterSheetCloses';
import { useCallback, useEffect, useRef, useState } from 'react';
import { showAppAlert, type LocalizedText } from '@/components/AppAlert';
import { Platform } from 'react-native';

export type ChildrenLessonDialogState = Readonly<{
  title: string;
  progress: LessonDownloadProgress | null;
  /** Offline with no copy: the popup stays up and says so. */
  offline?: boolean;
}>;

const ERROR_TITLE: LocalizedText = {
  en: 'Couldn’t open the lesson',
  zh: '無法開啟課程',
  'zh-cn': '无法打开课程',
  es: 'No se pudo abrir la lección',
};

/**
 * Opens this week's children's lesson for an age group (#529). On a phone, a
 * popup shows at once while the app finds the lesson and downloads its PDF,
 * and the copy then opens in the phone's own viewer. The browser opens it
 * instead where the phone has no PDF viewer, where the download fails, and
 * when there's no PDF yet (the age group's website). Offline with no copy, the
 * popup says there's no connection. The web opens it in the browser, as before.
 *
 * The viewer or the browser opens only once the popup, a sheet, has finished
 * closing: iOS can't show Quick Look over a sheet still sliding away (#867).
 * Give `onSheetClosed` to the popup as `onClosed`.
 */
export function useChildrenLessonOpener(language: SupportedLanguage) {
  const [dialog, setDialog] = useState<ChildrenLessonDialogState | null>(null);
  const request = useRef<AbortController | null>(null);
  const { afterSheetCloses, onSheetClosed } = useAfterSheetCloses();

  const cancel = useCallback(() => {
    request.current?.abort();
    request.current = null;
    setDialog(null);
  }, []);

  useEffect(() => () => request.current?.abort(), []);

  const open = useCallback(
    async (curriculum: ChildrenSabbathSchoolCurriculum, title: string) => {
      if (Platform.OS === 'web') {
        openCurrentChildrenSabbathSchool(curriculum, language);
        return;
      }
      // A second tap while the popup opens does nothing more.
      if (request.current) return;
      const controller = new AbortController();
      request.current = controller;
      const { signal } = controller;
      setDialog({ title, progress: null });
      try {
        const lesson = await getChildrenLesson(
          { curriculum, language },
          {
            signal,
            onProgress: (progress) => {
              if (!signal.aborted) setDialog({ title, progress });
            },
          },
        );
        if (signal.aborted) return;
        if ('offline' in lesson) {
          recordForScreenshot('lesson', { outcome: 'offline' });
          setDialog({ title, progress: null, offline: true });
          return;
        }
        const sheetClosed = afterSheetCloses();
        setDialog(null);
        await sheetClosed;
        // Left the screen while the popup closed: nothing opens.
        if (signal.aborted) return;
        // Why the browser opens instead of the viewer, for the key screens'
        // record (#551): no PDF this week, a failed download, or no viewer.
        let browserReason = isChildrenLessonPdf(lesson.url) ? 'download-failed' : 'no-pdf';
        if ('file' in lesson) {
          browserReason = 'no-viewer';
          try {
            if (await previewChildrenLesson(lesson.file, title)) {
              recordForScreenshot('lesson', { outcome: 'preview', url: lesson.url });
              return;
            }
          } catch (error) {
            browserReason = 'preview-failed';
            console.warn('Children Sabbath School lesson preview failed:', error);
          }
        }
        // Before the browser opens: it returns only once it's closed.
        recordForScreenshot('lesson', { outcome: 'browser', reason: browserReason, url: lesson.url });
        await openURL(lesson.url, ERROR_TITLE, LINK_ERROR_MESSAGE);
      } catch (error) {
        if (signal.aborted) return;
        recordForScreenshot('lesson', { outcome: 'error', error: String(error) });
        setDialog(null);
        showAppAlert(ERROR_TITLE, LINK_ERROR_MESSAGE);
        console.error('Children Sabbath School lesson error:', error);
      } finally {
        if (request.current === controller) request.current = null;
      }
    },
    [afterSheetCloses, language],
  );

  return { cancel, dialog, onSheetClosed, open };
}
