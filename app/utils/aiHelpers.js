// AI Helper Functions for SGS Admin Dashboard using Google Gemini

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. AI features will not work.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Translation using FastAPI backend
export const translateText = async (text, targetLang = 'en') => {
  if (!text) return text;

  try {
    const response = await fetch('http://16.112.236.67:8002/api/v1/admin/translate', {
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

    const data = await response.json();
    return data.translated || data.error || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};
  
// Text-to-Speech (Read Aloud)
export const speakText = (text, lang = 'en-US') => {
  if (!text || !window.speechSynthesis) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
};

// Speech-to-Text (Voice Input)
export const startListening = (callback, lang = 'en-US') => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser. Please use Chrome.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    callback(transcript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'not-allowed') {
      alert('Please allow microphone access to use voice input.');
    }
  };

  recognition.start();
};

// Bulk Translate using FastAPI Backend
export const bulkTranslate = async (items, targetLang = 'en', textField = 'name') => {
  if (!items || items.length === 0) return {};

  try {
    // 1. Gather all texts into a single array
    const textsToTranslate = items.map(item => item[textField]).filter(Boolean);
    if (textsToTranslate.length === 0) return {};

    // 2. Send them all at once in a SINGLE API request to your backend
    const response = await fetch('http://localhost:8000/api/v1/admin/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: textsToTranslate, // Passing the entire array here
        targetLanguage: targetLang,
        userInfo: {
          name: 'Admin',
          email: 'admin@sgs.com',
          role: 'Admin'
        }
      })
    });

    const data = await response.json();
    
    // Depending on what your backend returns (data.translated or data.translations)
    const translatedArray = data.translated || data.translations || [];
    
    // 3. Map the returned translations back to the original item IDs
    const resultMap = {};
    let translationIndex = 0;
    
    items.forEach((item) => {
      // Map correctly taking into account the filtered items
      if (item[textField]) {
         resultMap[item.id] = translatedArray[translationIndex] || item[textField];
         translationIndex++;
      }
    });
    
    return resultMap;
  } catch (error) {
    console.error('Bulk translation error:', error);
    return {};
  }
};

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'ur', name: 'Urdu' },
];

// Get language name from code
export const getLanguageName = (code) => {
  const lang = supportedLanguages.find(l => l.code === code);
  return lang ? lang.name : code;
}
