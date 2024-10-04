import React, { useState, useEffect } from 'react';

function AISuggestions({ items, onAddSuggestion, theme }) {
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    generateSuggestion();
  }, [items]);

  const generateSuggestion = () => {
    const categories = [...new Set(items.map(item => item.category))];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    const tasks = [
      "Review project documentation",
      "Schedule team meeting",
      "Update progress report",
      "Prepare presentation slides",
      "Research new technologies",
      "Refactor code base",
      "Write unit tests",
      "Conduct user interviews",
      "Design new feature mockups",
      "Optimize database queries"
    ];

    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    
    setSuggestion({
      name: randomTask,
      category: randomCategory,
      priority: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  return (
    <div className={`mt-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-4">AI Task Suggestion</h2>
      {suggestion && (
        <div className="mb-4">
          <p><strong>Task:</strong> {suggestion.name}</p>
          <p><strong>Category:</strong> {suggestion.category}</p>
          <p><strong>Priority:</strong> {suggestion.priority}</p>
          <p><strong>Due Date:</strong> {new Date(suggestion.dueDate).toLocaleDateString()}</p>
        </div>
      )}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            onAddSuggestion(suggestion);
            generateSuggestion();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
        >
          Add Suggestion
        </button>
        <button
          onClick={generateSuggestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Generate New Suggestion
        </button>
      </div>
    </div>
  );
}

export default AISuggestions;