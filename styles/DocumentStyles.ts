import { StyleSheet } from "react-native";

/**
 * Global styles for informational/reading pages (e.g., About, Beliefs, Privacy).
 * Ensures a consistent look and feel across the application's document-style content.
 */
export const DocumentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Main title of a document or informational page
  docTitle: {
    padding: 16,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 26,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  // The "Bar" header logic for content separation
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
    borderBottomWidth: 2,
    paddingBottom: 4,
    fontSize: 20,
  },
  description: {
    lineHeight: 22,
    fontSize: 16,
  },
  note: {
    marginVertical: 12,
    fontStyle: "italic",
    opacity: 0.8,
  },
  card: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});
