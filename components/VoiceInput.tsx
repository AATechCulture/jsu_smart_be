'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTransactionAdd: (transaction: {
    date: string;
    category: string;
    amount: number;
  }) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTransactionAdd }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
          const lastResult = event.results[event.results.length - 1];
          const text = lastResult[0].transcript.toLowerCase();
          setTranscript(text);
          processVoiceInput(text);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const processVoiceInput = (text: string) => {
    const words = text.split(' ');
    const isExpense = text.includes('expense');
    const isIncome = text.includes('income');
    
    const amount = words.find(word => !isNaN(parseFloat(word)));
    
    const categories = ['groceries', 'salary', 'entertainment', 'utilities', 'shopping', 'transportation', 'healthcare'];
    const category = categories.find(cat => text.includes(cat));

    if ((isExpense || isIncome) && amount && category) {
      const transaction = {
        date: new Date().toISOString().split('T')[0],
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: parseFloat(amount) * (isExpense ? -1 : 1)
      };
      
      onTransactionAdd(transaction);
      setTranscript(`Added ${isExpense ? 'expense' : 'income'}: ${category} - $${Math.abs(parseFloat(amount))}`);
    } else {
      setTranscript('Could not understand command. Please try again.');
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleListening}
          className={`px-4 py-2 rounded-full flex items-center ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors duration-200`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Listening
            </>
          )}
        </button>
      </div>
      
      {transcript && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="font-medium mb-2">Voice Commands:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>"Add expense groceries 50 dollars"</li>
          <li>"Add income salary 3000 dollars"</li>
          <li>"Add expense shopping 75 dollars"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceInput;