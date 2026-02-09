/**
 * Normalize line endings to Unix format (LF)
 * Handles Windows (CRLF), old Mac (CR), and Unix (LF)
 *
 * CommonJS version for use in CJS modules (e.g., installer framework).
 *
 * @param {string} content - The string content to normalize
 * @returns {string} Content with all line endings converted to LF
 */
function normalizeLineEndings(content) {
  if (typeof content !== 'string') {
    return content;
  }
  return content
    .replace(/\r\n/g, '\n')  // Windows CRLF -> LF
    .replace(/\r/g, '\n');    // Old Mac CR -> LF
}

module.exports = { normalizeLineEndings };
