import React, { useState } from 'react';

function TaskSharing({ item, theme }) {
  const [email, setEmail] = useState('');
  const [shared, setShared] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    // Simulate API call to share task
    const sharedTasks = JSON.parse(localStorage.getItem('sharedTasks') || '{}');
    if (!sharedTasks[email]) {
      sharedTasks[email] = [];
    }
    sharedTasks[email].push(item);
    localStorage.setItem('sharedTasks', JSON.stringify(sharedTasks));
    setShared(true);
    setEmail('');
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Share this task</h4>
      {shared ? (
        <p className="text-green-500">Task shared successfully!</p>
      ) : (
        <form onSubmit={handleShare} className="flex items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to share"
            className={`flex-grow p-2 rounded-l-md border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            required
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition duration-300"
          >
            Share
          </button>
        </form>
      )}
    </div>
  );
}

export default TaskSharing;