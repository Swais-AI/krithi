'use client';

import { useState, useEffect } from 'react';
import { startListening } from '../utils/aiHelpers';

export default function SpeechToTextButton({ onTranscript, placeholder = 'Search by voice...' }) {
  const [isListening, setIsListening] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVoiceSearch = () => {
    if (!isClient) return;
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    startListening((transcript) => {
      setIsListening(false);
      if (onTranscript) onTranscript(transcript);
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <button
      onClick={handleVoiceSearch}
      className={`p-1 rounded transition-colors ${
        isListening 
          ? 'text-red-400 animate-pulse' 
          : 'text-purple-400 hover:text-purple-300'
      }`}
      title={isListening ? 'Listening...' : 'Voice search'}
    >
      {isListening ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
