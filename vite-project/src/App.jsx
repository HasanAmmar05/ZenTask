import React, { useState, useEffect } from "react";
import "./index.css";

let nextId = 0;

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low"); // Priority feature
  const [tags, setTags] = useState(""); // Tags feature
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("items");
    if (savedItems) {
      return JSON.parse(savedItems);
    }
    return [];
  });
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    return ["Work", "Personal", "Shopping"];
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentFilter, setCurrentFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); // Search functionality
  const [archivedItems, setArchivedItems] = useState([]); // Archive feature
  const [theme, setTheme] = useState("light"); // Dark/Light mode feature

  // Persist items and categories in localStorage
  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("light", theme === "light");
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

    if (!newItem.trim() || !selectedCategory) {
      alert("Please enter a new item and select a category.");
      return;
    }

    setItems((prevItems) => [
      ...prevItems,
      {
        id: nextId++,
        name: newItem,
        isCompleted: false,
        category: selectedCategory,
        dueDate: dueDate || "No due date",
        priority: priority,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
    ]);

    setNewItem("");
    setDueDate("");
    setSelectedCategory("");
    setPriority("Low");
    setTags("");
  };

  // Sort items by due date
  const sortByDueDate = () => {
    setItems(
      [...items].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    );
  };

  // Get current date string for due date input minimum
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Check if the item is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  // Filter items by selected category
  const filteredItems =
    currentFilter === "All"
      ? items
      : items.filter((item) => item.category === currentFilter);

  // Add new category
  const addCategory = (newCategory) => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  // Archive completed tasks
  const archiveCompleted = () => {
    setArchivedItems([
      ...archivedItems,
      ...items.filter((item) => item.isCompleted),
    ]);
    setItems(items.filter((item) => !item.isCompleted));
  };

  // Dark/Light theme toggle
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${theme === "dark" ? "bg-gray-900 text-gray-200" : "text-gray-900"} p-8`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="form-row flex flex-col">
          <label htmlFor="item" className="text-lg font-semibold mb-1">New Item</label>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            id="item"
            className="p-2 rounded-md border border-gray-300 shadow-sm"
          />
        </div>
        <div className="form-row flex flex-col">
          <label htmlFor="dueDate" className="text-lg font-semibold mb-1">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={getTodayString()}
            className="p-2 rounded-md border border-gray-300 shadow-sm"
          />
        </div>
        <div className="form-row flex flex-col">
          <label htmlFor="category" className="text-lg font-semibold mb-1">Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-md border border-gray-300 shadow-sm"
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row flex flex-col">
          <label htmlFor="priority" className="text-lg font-semibold mb-1">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="p-2 rounded-md border border-gray-300 shadow-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="form-row flex flex-col">
          <label htmlFor="tags" className="text-lg font-semibold mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="p-2 rounded-md border border-gray-300 shadow-sm"
          />
        </div>
        <button
          className="mt-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          type="submit"
          disabled={!newItem.trim()}
        >
          Add
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <div className="flex items-center space-x-4">
          <label htmlFor="filter" className="font-semibold">Filter by category: </label>
          <select
            id="filter"
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
            className="p-2 rounded-md border border-gray-300 shadow-sm"
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
          className="p-2 rounded-md border border-gray-300 shadow-sm w-full"
        />
      </div>

      <div className="list-header mt-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">TO-DO List</h1>
        <div className="space-x-2">
          <button className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition" onClick={sortByDueDate}>
            Sort by Due Date
          </button>
          <button className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition" onClick={archiveCompleted}>
            Archive Completed Tasks
          </button>
          <button className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition" onClick={toggleTheme}>
            Toggle {theme === "light" ? "Dark" : "Light"} Mode
          </button>
        </div>
      </div>

      <ul className="list mt-4 space-y-2">
        {filteredItems
          .filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => (
            <li key={item.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-md bg-white shadow-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  onChange={() => toggleComplete(item.id)}
                  checked={item.isCompleted}
                  className="form-checkbox"
                />
                <span
                  className={`${item.isCompleted ? "line-through text-gray-500" : ""} ${isOverdue(item.dueDate) ? "text-red-500" : ""}`}
                >
                  {item.name} - Category: {item.category} - Due: {item.dueDate || "No due date"} - Priority: {item.priority} - Tags: {(item.tags || []).join(", ")}
                </span>
              </label>
              <button
                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                onClick={() => setItems((prevItems) => prevItems.filter((a) => a.id !== item.id))}
              >
                Delete
              </button>
            </li>
          ))}
      </ul>

      <h2 className="mt-8 text-xl font-bold">Archived Tasks</h2>
      <ul className="space-y-2">
        {archivedItems.map((item) => (
          <li key={item.id} className="p-2 bg-gray-200 rounded-md">
            {item.name} - Category: {item.category} - Due: {item.dueDate}
          </li>
        ))}
      </ul>
    </div>
  );
}
