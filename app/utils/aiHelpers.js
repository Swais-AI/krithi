// AI Helper functions for SGS Admin Dashboard
// All URLs now use environment variables

// Get the API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sgs.swais.in/api/admin';

// Get the app URL from environment
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sgs.swais.in';

/**
 * Translate text using the AI backend
 * @param {string} text - The text to translate
 * @param {string} targetLang - Target language code (e.g., 'hi', 'te')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang = 'en') => {
  if (!text || text.trim() === '') return text;
  
  try {
    console.log(`🔄 Translating text to ${targetLang}...`);
    
    // Use environment variable for API URL
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        targetLanguage: targetLang,
        userInfo: {
          name: 'Admin',
          email: 'admin@sgs.com',
          role: 'Admin'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.translated || data.error || text;
  } catch (error) {
    console.error('❌ Translation error:', error);
    return text;
  }
};

/**
 * Bulk translate multiple texts
 * @param {Array} items - Array of items with text to translate
 * @param {string} targetLang - Target language code
 * @param {string} field - The field name containing the text to translate
 * @returns {Promise<Object>} - Object with original text as key and translated text as value
 */
export const bulkTranslate = async (items, targetLang = 'en', field = 'name') => {
  if (!items || items.length === 0 || targetLang === 'en') return {};
  
  try {
    console.log(`🔄 Bulk translating ${items.length} items to ${targetLang}...`);
    
    // Use environment variable for API URL
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/translate/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: items.map(item => item[field]).filter(Boolean),
        targetLanguage: targetLang,
        userInfo: {
          name: 'Admin',
          email: 'admin@sgs.com',
          role: 'Admin'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Bulk translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    const translations = {};
    
    // Map translations back to items
    items.forEach((item, index) => {
      if (data.translations && data.translations[index]) {
        translations[item.id] = data.translations[index];
      }
    });
    
    return translations;
  } catch (error) {
    console.error('❌ Bulk translation error:', error);
    return {};
  }
};

/**
 * Supported languages for translation
 */
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
];

/**
 * Default export for backward compatibility
 */
const aiHelpers = {
  translateText,
  bulkTranslate,
  supportedLanguages
};

export default aiHelpers;
