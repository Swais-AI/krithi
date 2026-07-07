'use client';

import { useState, useEffect } from 'react';
import { speakText } from '../utils/aiHelpers';

export default function TextToSpeechButton({ text, label = 'Listen' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSpeak = () => {
    if (!text || !isClient) return;
    
    setIsSpeaking(true);
    speakText(text);
    
    const checkSpeaking = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
        clearInterval(checkSpeaking);
      }
    }, 500);
  };

  if (!isClient) {
    return null;
  }

  return (
    <button
      onClick={handleSpeak}
      disabled={!text || isSpeaking}
      className={`p-1 rounded transition-colors ${
        isSpeaking 
          ? 'text-yellow-400 animate-pulse' 
          : 'text-blue-400 hover:text-blue-300'
      }`}
      title={isSpeaking ? 'Speaking...' : `Listen to ${label}`}
    >
      {isSpeaking ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
}
