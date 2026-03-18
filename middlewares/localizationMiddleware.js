/**
 * Localization Middleware
 *
 * Extracts language preference from request headers or query params
 * Sets language on request object for use in controllers
 *
 * Priority:
 * 1. Query parameter: ?lang=ar
 * 2. Header: Accept-Language: ar
 * 3. Default: en
 */

import LocalizationService from "../utils/localizationService.js";

export const localizationMiddleware = (req, res, next) => {
  // Get language from query params first
  let lang = req.query.lang;

  // If not in query, try to get from Accept-Language header
  if (!lang && req.headers["accept-language"]) {
    // Extract language code from Accept-Language header (e.g., "ar-SA" -> "ar")
    lang = req.headers["accept-language"].split(",")[0].split("-")[0];
  }

  // Validate language is supported
  if (!lang || !LocalizationService.isSupported(lang)) {
    lang = LocalizationService.getDefaultLanguage();
  }

  // Set language on request object for use in controllers
  req.lang = lang;
  req.i18n = (key) => LocalizationService.getMessage(key, lang);

  next();
};
