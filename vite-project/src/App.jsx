import React, { useState, useEffect } from "react";
import "./index.css";

let nextId = 0;

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [tags, setTags] = useState("");
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("items");
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem("categories");
    return savedCategories ? JSON.parse(savedCategories) : ["Work", "Personal", "Shopping"];
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentFilter, setCurrentFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedItems, setArchivedItems] = useState(() => {
    const savedArchivedItems = localStorage.getItem("archivedItems");
    return savedArchivedItems ? JSON.parse(savedArchivedItems) : [];
  });
  const [showArchived, setShowArchived] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("archivedItems", JSON.stringify(archivedItems));
    localStorage.setItem("theme", theme);
    document.body.className = theme;
  }, [items, categories, archivedItems, theme]);

  const toggleComplete = (id, isArchived = false) => {
    const updateItems = (itemsList) =>
      itemsList.map(item =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      );

    if (isArchived) {
      setArchivedItems(updateItems);
    } else {
      setItems(updateItems);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newItem.trim() || !selectedCategory) {
      alert("Please enter a new item and select a category.");
      return;
    }
    setItems(prevItems => [
      ...prevItems,
      {
        id: nextId++,
        name: newItem,
        isCompleted: false,
        category: selectedCategory,
        dueDate: dueDate || "No due date",
        priority,
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
      },
    ]);
    setNewItem("");
    setDueDate("");
    setSelectedCategory("");
    setPriority("Low");
    setTags("");
  };

  const sortByDueDate = () => {
    const sortItems = (itemsList) =>
      [...itemsList].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    setItems(sortItems);
    setArchivedItems(sortItems);
  };

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const isOverdue = (dueDate) => new Date(dueDate) < new Date(new Date().toDateString());

  const filteredItems = currentFilter === "All"
    ? (showArchived ? archivedItems : items)
    : (showArchived ? archivedItems : items).filter(item => item.category === currentFilter);

  const addCategory = (newCategory) => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  const archiveCompleted = () => {
    const completedItems = items.filter(item => item.isCompleted);
    setArchivedItems(prevArchived => [...prevArchived, ...completedItems]);
    setItems(prevItems => prevItems.filter(item => !item.isCompleted));
  };

  const unarchiveItem = (id) => {
    const itemToUnarchive = archivedItems.find(item => item.id === id);
    if (itemToUnarchive) {
      setItems(prevItems => [...prevItems, itemToUnarchive]);
      setArchivedItems(prevArchived => prevArchived.filter(item => item.id !== id));
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  const toggleShowArchived = () => {
    setShowArchived(prev => !prev);
  };

  return (
    <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className={`space-y-4 p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item" className="block text-sm font-medium mb-1">New Item</label>
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                id="item"
                className={`w-full p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={getTodayString()}
                className={`w-full p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
              >
                <option value="">Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={`w-full p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
              />
            </div>
          </div>
          <button
            className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            type="submit"
            disabled={!newItem.trim()}
          >
            Add
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="filter" className="font-medium">Filter by category: </label>
              <select
                id="filter"
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value)}
                className={`p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
              >
                <option value="All">All</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} flex-grow md:max-w-xs`}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold">{showArchived ? "Archived Items" : "TO-DO List"}</h1>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
              onClick={sortByDueDate}
            >
              Sort by Due Date
            </button>
            {!showArchived && (
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
                onClick={archiveCompleted}
              >
                Archive Completed
              </button>
            )}
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300"
              onClick={toggleShowArchived}
            >
              {showArchived ? "Show Active Items" : "Show Archived Items"}
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
              onClick={toggleTheme}
            >
              Toggle {theme === "light" ? "Dark" : "Light"} Theme
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredItems
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-lg shadow-md ${
                  theme === "dark"
                    ? item.isCompleted ? "bg-gray-700" : "bg-gray-800"
                    : item.isCompleted ? "bg-green-100" : "bg-white"
                } border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${item.isCompleted ? "line-through text-gray-500" : ""}`}>
                    {item.name}
                  </h2>
                  <div className="space-x-2">
                    <button
                      className={`px-3 py-1 rounded-md ${
                        item.isCompleted
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white transition duration-300`}
                      onClick={() => toggleComplete(item.id, showArchived)}
                    >
                      {item.isCompleted ? "Undo" : "Complete"}
                    </button>
                    {showArchived && (
                      <button
                        className="px-3 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white transition duration-300"
                        onClick={() => unarchiveItem(item.id)}
                      >
                        Unarchive
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {item.dueDate}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-md ${
                    item.priority === "High"
                      ? "bg-red-500 text-white"
                      : item.priority === "Medium"
                      ? "bg-yellow-500 text-black"
                      : "bg-green-500 text-white"
                  }`}>
                    {item.priority}
                  </span>
                  <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {item.tags.join(", ")}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}