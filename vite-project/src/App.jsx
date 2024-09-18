import React, { useState, useEffect } from "react";
import "./index.css";

let nextId = 0;

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState('Low');  // Priority feature
  const [tags, setTags] = useState('');  // Tags feature
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('items');
    if (savedItems) {
      return JSON.parse(savedItems);
    }
    return [];
  });
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    return ['Work', 'Personal', 'Shopping'];
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentFilter, setCurrentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState("");  // Search functionality
  const [archivedItems, setArchivedItems] = useState([]);  // Archive feature
  const [theme, setTheme] = useState('light');  // Dark/Light mode feature

  // Persist items and categories in localStorage
  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Toggle completion status
  const toggleComplete = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  // Handle new item submission
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!newItem.trim()) return;

    setItems((prevItems) => [
      ...prevItems,
      {
        id: nextId++,
        name: newItem,
        isCompleted: false,
        category: selectedCategory,
        dueDate: dueDate,
        priority: priority,
        tags: tags.split(',').map(tag => tag.trim()),  // Handling multiple tags
      }
    ]);

    setNewItem("");
    setDueDate("");
    setSelectedCategory("");
    setPriority('Low');
    setTags('');
  };

  // Sort items by due date
  const sortByDueDate = () => {
    setItems([...items].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  };

  // Get current date string for due date input minimum
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if the item is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  // Filter items by selected category
  const filteredItems = currentFilter === 'All' 
    ? items 
    : items.filter(item => item.category === currentFilter);

  // Add new category
  const addCategory = (newCategory) => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  // Archive completed tasks
  const archiveCompleted = () => {
    setArchivedItems([...archivedItems, ...items.filter(item => item.isCompleted)]);
    setItems(items.filter(item => !item.isCompleted));
  };

  // Dark/Light theme toggle
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <form className="new-item-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="item">New Item</label>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            id="item"
          />
        </div>
        <div className="form-row">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={getTodayString()}
          />
        </div>
        <div className="form-row">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <button className="btn" type="submit" disabled={!newItem.trim()}>
          Add
        </button>
      </form>

      <div>
        <label htmlFor="filter">Filter by category: </label>
        <select
          id="filter"
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value)}
        >
          <option value="All">All</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="list-header">
        <h1 className="header">TO-DO List</h1>
        <button className="btn btn-secondary" onClick={sortByDueDate}>Sort by Due Date</button>
        <button className="btn btn-secondary" onClick={archiveCompleted}>Archive Completed Tasks</button>
        <button className="btn btn-secondary" onClick={toggleTheme}>
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      <ul className="list">
        {filteredItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                onChange={() => toggleComplete(item.id)}
                checked={item.isCompleted}
              />
              <span
                style={{
                  textDecoration: item.isCompleted ? "line-through" : "none",
                  color: isOverdue(item.dueDate) ? "red" : "inherit",
                }}
              >
                {item.name} - Category: {item.category} - Due: {item.dueDate}
                - Priority: {item.priority} - Tags: {item.tags.join(', ')}
              </span>
            </label>
            <button
              className="btn btn-danger"
              onClick={() => {
                setItems((prevItems) =>
                  prevItems.filter((a) => a.id !== item.id)
                );
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>Archived Tasks</h2>
      <ul>
        {archivedItems.map((item) => (
          <li key={item.id}>
            <span>{item.name} - Category: {item.category} - Due: {item.dueDate}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
