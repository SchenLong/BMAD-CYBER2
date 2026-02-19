/**
 * Safe JSON parse utility
 * Provides error handling for JSON.parse operations
 */

/**
 * Safely parse a JSON string with error handling
 * @param jsonString The JSON string to parse
 * @param fallback The fallback value to return if parsing fails
 * @returns The parsed object or the fallback value
 */
export function safeJsonParse<T = any>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) {
    return fallback;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Safely parse a JSON string array
 * @param jsonString The JSON string to parse
 * @returns The parsed array or an empty array
 */
export function safeJsonArrayParse<T = any>(jsonString: string | null | undefined): T[] {
  return safeJsonParse<T[]>(jsonString, []);
}

/**
 * Safely parse a JSON object
 * @param jsonString The JSON string to parse
 * @returns The parsed object or an empty object
 */
export function safeJsonObjectParse<T = Record<string, any>>(jsonString: string | null | undefined): T {
  return safeJsonParse<T>(jsonString, {} as T);
}
