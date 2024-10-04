import React, { useState, useEffect } from 'react';

function VoiceCommands({ onAddTask, categories, theme }) {
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
      const task = parseVoiceCommand(transcript);
      onAddTask(task);
      setTranscript('');
    }
  };

  const parseVoiceCommand = (command) => {
    const taskRegex = /add (?:a )?task(?: called)? (.+)/i;
    const categoryRegex = /(?:in|to) (?:the )?category (.+)/i;
    const priorityRegex = /(?:with|at) (.+) priority/i;
    const dueDateRegex = /(?:due|by) (.+)/i;

    const taskMatch = command.match(taskRegex);
    const categoryMatch = command.match(categoryRegex);
    const priorityMatch = command.match(priorityRegex);
    const dueDateMatch = command.match(dueDateRegex);

    const task = {
      name: taskMatch ? taskMatch[1] : 'Untitled Task',
      category: categoryMatch ? categoryMatch[1] : getRandomCategory(),
      priority: priorityMatch ? capitalizeFirstLetter(priorityMatch[1]) : getRandomPriority(),
      dueDate: dueDateMatch ? new Date(dueDateMatch[1]).toISOString() : getRandomDueDate(),
    };

    return task;
  };

  const getRandomCategory = () => {
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const getRandomPriority = () => {
    const priorities = ['Low', 'Medium', 'High'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  };

  const getRandomDueDate = () => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    return futureDate.toISOString();
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
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
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Voice Command Examples:</h3>
        <ul className="list-disc list-inside">
          <li>Add a task called Study JavaScript</li>
          <li>Add a task Study React in the category Learning with high priority due next week</li>
          <li>Add task Buy groceries to the category Shopping with medium priority due tomorrow</li>
        </ul>
      </div>
    </div>
  );
}

export default VoiceCommands;