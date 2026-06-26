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

// Language Translator using Gemini
export const translateText = async (text, targetLang = 'en') => {
  if (!text) return text;
  
  const genAI = getGeminiClient();
  if (!genAI) return text;

  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' 
    });
    
    const prompt = `Translate the following text to ${targetLang}. Only return the translated text, nothing else: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || text;
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

// Bulk Translate using Gemini
export const bulkTranslate = async (items, targetLang = 'en', textField = 'name') => {
  if (!items || items.length === 0) return {};
  
  const genAI = getGeminiClient();
  if (!genAI) return {};

  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' 
    });
    
    const texts = items.map(item => item[textField]).filter(Boolean);
    if (texts.length === 0) return {};
    
    const prompt = `Translate the following texts to ${targetLang}. Return only the translations as a JSON array, nothing else: ${JSON.stringify(texts)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    try {
      const translations = JSON.parse(translatedText);
      const resultMap = {};
      items.forEach((item, index) => {
        if (translations[index]) {
          resultMap[item.id] = translations[index];
        }
      });
      return resultMap;
    } catch (e) {
      // If JSON parsing fails, try to extract translations line by line
      const lines = translatedText.split('\n').filter(Boolean);
      const resultMap = {};
      items.forEach((item, index) => {
        if (lines[index]) {
          resultMap[item.id] = lines[index];
        }
      });
      return resultMap;
    }
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
};
