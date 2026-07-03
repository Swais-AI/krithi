'use client';

import { useState } from 'react';
import { supportedLanguages, translateText } from '../utils/aiHelpers';

export default function TranslationDropdown({ text, onTranslate, label = 'Translate' }) {
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleTranslate = async (selectedLang) => {
    const langToUse = selectedLang || targetLang;
    if (!text) return;
    setIsTranslating(true);
    try {
      const result = await translateText(text, langToUse);
      setTranslatedText(result);
      if (onTranslate) onTranslate(result, langToUse);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
      setShowDropdown(false);
    }
  };

  const handleLanguageChange = (langCode) => {
    setTargetLang(langCode);
    handleTranslate(langCode);
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
          title={`${label} ${text ? `"${text.substring(0, 20)}..."` : ''}`}
          disabled={!text}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </button>
        {isTranslating && (
          <span className="text-xs text-yellow-400 animate-pulse">translating...</span>
        )}
        {translatedText && !isTranslating && (
          <span className="text-xs text-green-400" title={translatedText}>
            ✓
          </span>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-[9999] mt-1 bg-slate-800 rounded-lg shadow-lg border border-white/10 p-2 min-w-[150px] max-h-60 overflow-y-auto top-full left-0">
          <div className="text-xs text-white/50 mb-1 px-2">Translate to:</div>
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                targetLang === lang.code
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {lang.name}
              {targetLang === lang.code && ' ✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
