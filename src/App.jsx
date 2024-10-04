import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import CategoryManager from './components/CategoryManager';
import ThemeToggle from './components/ThemeToggle';
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AISuggestions from './components/AISuggestions';
import VoiceCommands from './components/VoiceCommands';
import Gamification from './components/Gamification';
import './index.css';

function App() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('todoItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : ['Work', 'Personal', 'Shopping'];
  });
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [currentFilter, setCurrentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [archivedItems, setArchivedItems] = useState(() => {
    const savedArchivedItems = localStorage.getItem('archivedItems');
    return savedArchivedItems ? JSON.parse(savedArchivedItems) : [];
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const [showGamification, setShowGamification] = useState(false);

  useEffect(() => {
    localStorage.setItem('todoItems', JSON.stringify(items));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('theme', theme);
    localStorage.setItem('archivedItems', JSON.stringify(archivedItems));
  }, [items, categories, theme, archivedItems]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  const handleAddTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      isCompleted: false,
      tags: task.tags || [],
    };
    setItems(prevItems => [...prevItems, newTask]);
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center"> Advanced Todo App </h1>
        <TaskForm 
          categories={categories} 
          setItems={setItems} 
          theme={theme}
        />
        <CategoryManager 
          categories={categories} 
          setCategories={setCategories} 
          items={items} 
          setItems={setItems} 
          theme={theme}
        />
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
          />
        </div>
        <div className="mb-4">
          <select
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
            className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <TaskList 
            items={items} 
            setItems={setItems}
            archivedItems={archivedItems}
            setArchivedItems={setArchivedItems}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            currentFilter={currentFilter}
            searchQuery={searchQuery}
            theme={theme}
          />
        </DragDropContext>
        <div className="mt-4 text-center space-x-4">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
          >
            {showAISuggestions ? 'Hide AI Suggestions' : 'Show AI Suggestions'}
          </button>
          <button
            onClick={() => setShowVoiceCommands(!showVoiceCommands)}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition duration-300"
          >
            {showVoiceCommands ? 'Hide Voice Commands' : 'Show Voice Commands'}
          </button>
          <button
            onClick={() => setShowGamification(!showGamification)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300"
          >
            {showGamification ? 'Hide Gamification' : 'Show Gamification'}
          </button>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        {showAnalytics && <AnalyticsDashboard items={items} theme={theme} />}
        {showAISuggestions && (
          <AISuggestions
            items={items}
            onAddSuggestion={handleAddTask}
            theme={theme}
          />
        )}
        {showVoiceCommands && (
          <VoiceCommands
            onAddTask={handleAddTask}
            theme={theme}
          />
        )}
        {showGamification && (
          <Gamification
            items={items}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

export default App;