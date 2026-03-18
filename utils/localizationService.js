/**
 * Localization Service
 *
 * Provides localized messages based on language preference
 * Default language: English
 * Supported languages: en, ar
 */

import { en } from "../locales/en.js";
import { ar } from "../locales/ar.js";

const languages = { en, ar };

class LocalizationService {
  /**
   * Get localized message
   * @param {string} key - Message key
   * @param {string} lang - Language code (en, ar)
   * @returns {string} Localized message
   */
  static getMessage(key, lang = "en") {
    const selectedLang = languages[lang] || languages.en;
    return selectedLang[key] || key;
  }

  /**
   * Get all messages for a language
   * @param {string} lang - Language code
   * @returns {object} All messages for the language
   */
  static getAllMessages(lang = "en") {
    return languages[lang] || languages.en;
  }

  /**
   * Check if language is supported
   * @param {string} lang - Language code
   * @returns {boolean}
   */
  static isSupported(lang) {
    return lang in languages;
  }

  /**
   * Get default language
   * @returns {string}
   */
  static getDefaultLanguage() {
    return "en";
  }
}

export default LocalizationService;
