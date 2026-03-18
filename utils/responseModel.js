/**
 * Standard Response Model for API responses
 * Structure:
 * - success: boolean (true for success, false for error)
 * - message: string (descriptive message - localized)
 * - data: any (response data, optional)
 * - error: string (error details, only in error responses)
 *
 * Note: Pass i18n function from middleware for localized messages
 */

import LocalizationService from "./localizationService.js";

class ResponseModel {
  /**
   * Create a success response
   * @param {string|object} messageKeyOrI18n - Message key or i18n function
   * @param {any} data - Response data
   * @param {string} lang - Optional language for direct translation
   * @returns {object} Formatted response object
   */
  static success(messageKeyOrI18n, data = null, lang = "en", fallbackKey = "") {
    let message;

    if (typeof messageKeyOrI18n === "function") {
      message = messageKeyOrI18n(fallbackKey);
    } else if (typeof messageKeyOrI18n === "string") {
      message = LocalizationService.getMessage(messageKeyOrI18n, lang);
    }

    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Create an error response
   * @param {string|object} messageKeyOrI18n - Message key or i18n function
   * @param {string} error - Error details
   * @param {string} lang - Optional language for direct translation
   * @returns {object} Formatted error response object
   */
  static error(messageKeyOrI18n, error = null, lang = "en", fallbackKey = "") {
    let message;

    if (typeof messageKeyOrI18n === "function") {
      message = messageKeyOrI18n(fallbackKey);
    } else if (typeof messageKeyOrI18n === "string") {
      message = LocalizationService.getMessage(messageKeyOrI18n, lang);
    }

    return {
      success: false,
      message,
      error,
    };
  }
}

export default ResponseModel;
