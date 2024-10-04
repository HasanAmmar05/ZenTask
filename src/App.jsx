import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import CategoryManager from './components/CategoryManager';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

function App() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('items');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : ['Work', 'Personal', 'Shopping'];
  });
  const [archivedItems, setArchivedItems] = useState(() => {
    const savedArchivedItems = localStorage.getItem('archivedItems');
    return savedArchivedItems ? JSON.parse(savedArchivedItems) : [];
  });
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [showArchived, setShowArchived] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('archivedItems', JSON.stringify(archivedItems));
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [items, categories, archivedItems, theme]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        <TaskForm 
          categories={categories} 
          setItems={setItems} 
          theme={theme}
        />
        <div className={`mt-4 p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setCurrentFilter('All')}
              className={`px-3 py-1 rounded-md ${currentFilter === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCurrentFilter(category)}
                className={`px-3 py-1 rounded-md ${currentFilter === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
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
        <CategoryManager 
          categories={categories} 
          setCategories={setCategories} 
          items={items}
          setItems={setItems}
          theme={theme}
        />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </div>
  );
}

export default App;