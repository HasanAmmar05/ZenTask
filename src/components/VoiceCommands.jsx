import React, { useState, useEffect } from 'react';

function VoiceCommands({ onAddTask, theme }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    let recognition = null;

    if ('webkitSpeechRecognition' in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    const recognition = new window.webkitSpeechRecognition();
    recognition.stop();

    if (transcript) {
      onAddTask({
        name: transcript,
        category: 'Voice Command',
        priority: 'Medium',
        dueDate: new Date().toISOString(),
      });
      setTranscript('');
    }
  };

  return (
    <div className={`mt-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-4">Voice Commands</h2>
      <div className="flex items-center space-x-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-4 py-2 rounded-md transition duration-300 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {isListening ? 'Listening...' : 'Click to start'}
        </p>
      </div>
      {transcript && (
        <p className="mt-4">
          <strong>Transcript:</strong> {transcript}
        </p>
      )}
    </div>
  );
}

export default VoiceCommands;