import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

let nextId = 0;

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [dueDate, setDueDate] = useState(null);
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
  const [newCategory, setNewCategory] = useState("");
  const [filterBy, setFilterBy] = useState("none"); // New state for tracking active filter

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

  const deleteItem = (id, isArchived = false) => {
    if (isArchived) {
      setArchivedItems(prevItems => prevItems.filter(item => item.id !== id));
    } else {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
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
        dueDate: dueDate ? dueDate.toISOString() : null,
        priority,
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
      },
    ]);
    setNewItem("");
    setDueDate(null);
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

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date(new Date().toDateString());

  const addCategory = (event) => {
    event.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const deleteCategory = (categoryToDelete) => {
    setCategories(categories.filter(category => category !== categoryToDelete));
    setItems(items.map(item => 
      item.category === categoryToDelete ? { ...item, category: "" } : item
    ));
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

  const filterByCategory = () => {
    setFilterBy("category");
  };

  const filterByPriority = () => {
    setFilterBy("priority");
  };

  const resetFilter = () => {
    setFilterBy("none");
  };

  const getFilteredItems = () => {
    let itemsToFilter = showArchived ? archivedItems : items;
    
    if (currentFilter !== "All") {
      itemsToFilter = itemsToFilter.filter(item => item.category === currentFilter);
    }
    
    return itemsToFilter.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const renderFilteredItems = () => {
    const filteredItems = getFilteredItems();

    if (filterBy === "category") {
      const categorizedItems = {};
      categories.forEach(category => {
        categorizedItems[category] = filteredItems.filter(item => item.category === category);
      });

      return (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>{category}</h3>
              {renderItemList(categorizedItems[category])}
            </div>
          ))}
        </div>
      );
    } else if (filterBy === "priority") {
      const priorities = ["High", "Medium", "Low"];
      const prioritizedItems = {};
      priorities.forEach(priority => {
        prioritizedItems[priority] = filteredItems.filter(item => item.priority === priority);
      });

      return (
        <div className="space-y-8">
          {priorities.map(priority => (
            <div key={priority} className="space-y-4">
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>{priority} Priority</h3>
              {renderItemList(prioritizedItems[priority])}
            </div>
          ))}
        </div>
      );
    } else {
      return renderItemList(filteredItems);
    }
  };

  const renderItemList = (items) => {
    return (
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className={`p-4 rounded-lg shadow-md ${
              theme === "dark"
                ? item.isCompleted ? "bg-gray-700" : isOverdue(item.dueDate) ? "bg-red-900" : "bg-gray-800"
                : item.isCompleted ? "bg-green-100" : isOverdue(item.dueDate) ? "bg-red-100" : "bg-white"
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
                  } text-white transition duration-300 shadow-md`}
                  onClick={() => toggleComplete(item.id, showArchived)}
                >
                  {item.isCompleted ? "Undo" : "Complete"}
                </button>
                <button
                  className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white transition duration-300 shadow-md"
                  onClick={() => deleteItem(item.id, showArchived)}
                >
                  Delete
                </button>
                {showArchived && (
                  <button
                    className="px-3 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white transition duration-300 shadow-md"
                    onClick={() => unarchiveItem(item.id)}
                  >
                    Unarchive
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No due date"}
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
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Category: {item.category}
              </span>
              <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Tags: {item.tags.join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                className={`w-full p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="Select a date"
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
            className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
            type="submit"
            disabled={!newItem.trim()}
          >
            Add
          </button>
        </form>

        <form onSubmit={addCategory} className={`mt-4 p-4 rounded-lg shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
              className={`flex-grow p-2 rounded-md border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 shadow-md"
            >
              Add Category
            </button>
          </div>
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 shadow-md"
              onClick={sortByDueDate}
            >
              Sort by Due Date
            </button>
            <button
              className={`px-4 py-2 ${filterBy === "category" ? "bg-blue-700" : "bg-blue-600"} text-white rounded-md hover:bg-blue-700 transition duration-300 shadow-md`}
              onClick={filterByCategory}
            >
              Filter by Categories
            </button>
            <button
              className={`px-4 py-2 ${filterBy === "priority" ? "bg-indigo-700" : "bg-indigo-600"} text-white rounded-md hover:bg-indigo-700 transition duration-300 shadow-md`}
              onClick={filterByPriority}
            >
              Filter by Priority
            </button>
            {filterBy !== "none" && (
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300 shadow-md"
                onClick={resetFilter}
              >
                Reset Filter
              </button>
            )}
            {!showArchived && (
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300 shadow-md"
                onClick={archiveCompleted}
              >
                Archive Completed
              </button>
            )}
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300 shadow-md"
              onClick={toggleShowArchived}
            >
              {showArchived ? "Show Active Items" : "Show Archived Items"}
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300 shadow-md"
              onClick={toggleTheme}
            >
              Toggle {theme === "light" ? "Dark" : "Light"} Theme
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {renderFilteredItems()}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div key={index} className={`p-4 rounded-lg shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} flex justify-between items-center`}>
                <span>{category}</span>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 shadow-sm"
                  onClick={() => deleteCategory(category)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}