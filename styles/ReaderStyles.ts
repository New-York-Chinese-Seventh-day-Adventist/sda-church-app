import { Platform, StyleSheet } from 'react-native';

/**
 * Shared styles for the Bible Reader and other immersive reading components.
 */
export const ReaderStyles = StyleSheet.create({
  readerContainer: { flex: 1 },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    zIndex: 10,
    height: 56,
  },
  bottomSelectorBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    zIndex: 100,
  },
  backButton: { padding: 15 },
  selectorRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    gap: 8,
    paddingRight: 15,
  },
  selector: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  selectorText: { fontWeight: '700', fontSize: 13, lineHeight: 18 },
  bibleScroll: { flex: 1 },
  bibleContent: { padding: 20, paddingBottom: 80 },
  verseText: {
    fontSize: 19,
    lineHeight: 30,
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.5,
    lineHeight: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Selection Overlays / Modals
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', lineHeight: 28 },
  title: { fontSize: 20, fontWeight: '800', lineHeight: 28 }, // Alias to prevent 'undefined' errors
  modalItem: {
    padding: 18,
    borderBottomWidth: 0.5,
  },
  modalItemText: { fontSize: 16, lineHeight: 22 },
});
