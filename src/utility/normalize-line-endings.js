/**
 * Normalize line endings to Unix format (LF)
 * Handles Windows (CRLF), old Mac (CR), and Unix (LF)
 *
 * @param {string} content - The string content to normalize
 * @returns {string} Content with all line endings converted to LF
 */
export function normalizeLineEndings(content) {
  if (typeof content !== 'string') {
    return content;
  }
  return content
    .replace(/\r\n/g, '\n')  // Windows CRLF -> LF
    .replace(/\r/g, '\n');    // Old Mac CR -> LF
}
