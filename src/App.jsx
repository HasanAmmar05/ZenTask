import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DatePicker from "react-datepicker";
import { Editor } from "@tinymce/tinymce-react";
import { Line } from "react-chartjs-2";
import "react-datepicker/dist/react-datepicker.css";
import PomodoroTimer from "./PomodoroTimer";
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
    return savedCategories
      ? JSON.parse(savedCategories)
      : ["Work", "Personal", "Shopping"];
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
  const [filterBy, setFilterBy] = useState("none");

  // New state for advanced features
  const [subTasks, setSubTasks] = useState({});
  const [taskDependencies, setTaskDependencies] = useState({});
  const [pomodoroTimer, setPomodoroTimer] = useState({
    taskId: null,
    timeLeft: 25 * 60,
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [activeTimers, setActiveTimers] = useState({});

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("archivedItems", JSON.stringify(archivedItems));
    localStorage.setItem("theme", theme);
    document.body.className = theme;

    // Save new state to localStorage
    localStorage.setItem("subTasks", JSON.stringify(subTasks));
    localStorage.setItem("taskDependencies", JSON.stringify(taskDependencies));
    localStorage.setItem("taskTemplates", JSON.stringify(taskTemplates));
  }, [
    items,
    categories,
    archivedItems,
    theme,
    subTasks,
    taskDependencies,
    taskTemplates,
  ]);

  useEffect(() => {
    // Load additional data from localStorage
    const savedSubTasks = localStorage.getItem("subTasks");
    if (savedSubTasks) setSubTasks(JSON.parse(savedSubTasks));

    const savedTaskDependencies = localStorage.getItem("taskDependencies");
    if (savedTaskDependencies)
      setTaskDependencies(JSON.parse(savedTaskDependencies));

    const savedTaskTemplates = localStorage.getItem("taskTemplates");
    if (savedTaskTemplates) setTaskTemplates(JSON.parse(savedTaskTemplates));

    // Request notification permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const toggleComplete = (id, isArchived = false) => {
    const updateItems = (itemsList) =>
      itemsList.map((item) =>
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
      setArchivedItems((prevItems) =>
        prevItems.filter((item) => item.id !== id)
      );
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newItem.trim() || !selectedCategory) {
      alert("Please enter a new item and select a category.");
      return;
    }
    const newTaskItem = {
      id: nextId++,
      name: newItem,
      isCompleted: false,
      category: selectedCategory,
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      description: taskDescription,
      recurrence: null, // Add recurrence field for recurring tasks
    };
    setItems((prevItems) => [...prevItems, newTaskItem]);

    // Handle recurring tasks
    if (newTaskItem.recurrence) {
      handleRecurringTask(newTaskItem);
    }

    setNewItem("");
    setDueDate(null);
    setSelectedCategory("");
    setPriority("Low");
    setTags("");
    setTaskDescription("");
  };

  const sortByDueDate = () => {
    const sortItems = (itemsList) =>
      [...itemsList].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setItems(sortItems);
    setArchivedItems(sortItems);
  };

  const isOverdue = (dueDate) =>
    dueDate && new Date(dueDate) < new Date(new Date().toDateString());

  const addCategory = (event) => {
    event.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const deleteCategory = (categoryToDelete) => {
    setCategories(
      categories.filter((category) => category !== categoryToDelete)
    );
    setItems(
      items.map((item) =>
        item.category === categoryToDelete ? { ...item, category: "" } : item
      )
    );
  };

  const archiveCompleted = () => {
    const completedItems = items.filter((item) => item.isCompleted);
    setArchivedItems((prevArchived) => [...prevArchived, ...completedItems]);
    setItems((prevItems) => prevItems.filter((item) => !item.isCompleted));
  };

  const unarchiveItem = (id) => {
    const itemToUnarchive = archivedItems.find((item) => item.id === id);
    if (itemToUnarchive) {
      setItems((prevItems) => [...prevItems, itemToUnarchive]);
      setArchivedItems((prevArchived) =>
        prevArchived.filter((item) => item.id !== id)
      );
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleShowArchived = () => {
    setShowArchived((prev) => !prev);
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
      itemsToFilter = itemsToFilter.filter(
        (item) => item.category === currentFilter
      );
    }

    return itemsToFilter.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Drag and Drop Reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  // Pomodoro Timer
  useEffect(() => {
    let interval = null;
    if (pomodoroTimer.taskId && pomodoroTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroTimer((prevTimer) => ({
          ...prevTimer,
          timeLeft: prevTimer.timeLeft - 1,
        }));
      }, 1000);
    } else if (pomodoroTimer.timeLeft === 0) {
      clearInterval(interval);
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer Finished", {
          body: "Time to take a break!",
        });
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroTimer]);

  const startPomodoroTimer = (taskId) => {
    setPomodoroTimer({ taskId, timeLeft: 25 * 60 });
  };

  // Recurring Tasks
  const handleRecurringTask = (task) => {
    const newTask = {
      ...task,
      id: nextId++,
      dueDate: calculateNextDueDate(task.recurrence, task.dueDate),
    };
    setItems((prevItems) => [...prevItems, newTask]);
  };

  const calculateNextDueDate = (recurrence, currentDueDate) => {
    const date = new Date(currentDueDate);
    switch (recurrence) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        return null;
    }
    return date.toISOString();
  };

  // Subtasks
  const addSubTask = (parentId, subTaskName) => {
    setSubTasks((prevSubTasks) => ({
      ...prevSubTasks,
      [parentId]: [
        ...(prevSubTasks[parentId] || []),
        { id: nextId++, name: subTaskName, isCompleted: false },
      ],
    }));
  };

  const toggleTimer = (id) => {
    setActiveTimers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTimerComplete = (id) => {
    console.log(`Timer completed for task ${id}`);
    // You can add logic here to handle timer completion, e.g., mark the task as completed
  };

  const toggleSubTaskComplete = (parentId, subTaskId) => {
    setSubTasks((prevSubTasks) => ({
      ...prevSubTasks,
      [parentId]: prevSubTasks[parentId].map((subTask) =>
        subTask.id === subTaskId
          ? { ...subTask, isCompleted: !subTask.isCompleted }
          : subTask
      ),
    }));
  };

  // Data Visualization
  const getChartData = () => {
    const completedTasks = items.filter((item) => item.isCompleted).length;
    const totalTasks = items.length;

    return {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          data: [completedTasks, totalTasks - completedTasks],
          backgroundColor: ["#4CAF50", "#FFA000"],
        },
      ],
    };
  };

  // Task Dependencies
  const addTaskDependency = (taskId, dependencyId) => {
    setTaskDependencies((prevDependencies) => ({
      ...prevDependencies,
      [taskId]: [...(prevDependencies[taskId] || []), dependencyId],
    }));
  };

  const removeTaskDependency = (taskId, dependencyId) => {
    setTaskDependencies((prevDependencies) => ({
      ...prevDependencies,
      [taskId]: prevDependencies[taskId].filter((id) => id !== dependencyId),
    }));
  };

  // Improved Notifications
  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      items.forEach((item) => {
        if (
          item.dueDate &&
          new Date(item.dueDate) <= now &&
          !item.isCompleted
        ) {
          if (Notification.permission === "granted") {
            new Notification("Task Due", {
              body: `The task "${item.name}" is now due!`,
            });
          }
        }
      });
    };

    if (showNotifications) {
      const interval = setInterval(checkDueTasks, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [items, showNotifications]);

  // Task Templates
  const saveAsTemplate = (task) => {
    setTaskTemplates((prevTemplates) => [
      ...prevTemplates,
      { ...task, id: nextId++ },
    ]);
  };

  const applyTemplate = (template) => {
    setNewItem(template.name);
    setDueDate(template.dueDate ? new Date(template.dueDate) : null);
    setPriority(template.priority);
    setTags(template.tags.join(", "));
    setSelectedCategory(template.category);
    setTaskDescription(template.description || "");
  };

  const renderFilteredItems = () => {
    const filteredItems = getFilteredItems();

    if (filterBy === "category") {
      const categorizedItems = {};
      categories.forEach((category) => {
        categorizedItems[category] = filteredItems.filter(
          (item) => item.category === category
        );
      });

      const onDragEnd = (result) => {
        if (!result.destination) {
          return;
        }

        const reorder = (list, startIndex, endIndex) => {
          const result = Array.from(list);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return result;
        };

        const newItems = reorder(
          items,
          result.source.index,
          result.destination.index
        );

        setItems(newItems);
      };

      const toggleTimer = (id) => {
        setActiveTimers((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));
      };

      const handleTimerComplete = (id) => {
        console.log(`Timer completed for task ${id}`);
        // You can add logic here to handle timer completion, e.g., mark the task as completed
      };

      return (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <h3
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                {category}
              </h3>
              {renderItemList(categorizedItems[category])}
            </div>
          ))}
        </div>
      );
    } else if (filterBy === "priority") {
      const priorities = ["High", "Medium", "Low"];
      const prioritizedItems = {};
      priorities.forEach((priority) => {
        prioritizedItems[priority] = filteredItems.filter(
          (item) => item.priority === priority
        );
      });

      return (
        <div className="space-y-8">
          {priorities.map((priority) => (
            <div key={priority} className="space-y-4">
              <h3
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                {priority} Priority
              </h3>
              {renderItemList(prioritizedItems[priority])}
            </div>
          ))}
        </div>
      );
    } else {
      return renderItemList(filteredItems);
    }
  };

  const sortTasksByCategory = () => {
    const sortedTasks = [...tasks].sort((a, b) =>
      a.category.localeCompare(b.category)
    );
    setTasks(sortedTasks);
  };

  const renderItemList = (items) => {
    return (
      <>
        <button
          onClick={sortTasksByCategory}
          className="px-3 py-1 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white transition duration-300 mb-4"
        >
          Sort by Category
        </button>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {items.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 rounded-lg shadow-md ${
                          theme === "dark"
                            ? item.isCompleted
                              ? "bg-gray-700"
                              : isOverdue(item.dueDate)
                              ? "bg-red-900"
                              : "bg-gray-800"
                            : item.isCompleted
                            ? "bg-green-100"
                            : isOverdue(item.dueDate)
                            ? "bg-red-100"
                            : "bg-white"
                        } border ${
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-200"
                        }
                      ${snapshot.isDragging ? "opacity-75" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <h2
                            className={`text-lg font-semibold ${
                              item.isCompleted
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {item.name}
                          </h2>
                          <div className="space-x-2">
                            <button
                              className={`px-3 py-1 rounded-md ${
                                item.isCompleted
                                  ? "bg-gray-500 hover:bg-gray-600"
                                  : "bg-blue-500 hover:bg-blue-600"
                              } text-white transition duration-300 shadow-md`}
                              onClick={() =>
                                toggleComplete(item.id, showArchived)
                              }
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
                          <span
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {item.dueDate
                              ? new Date(item.dueDate).toLocaleDateString()
                              : "No due date"}
                          </span>
                          <span
                            className={`text-sm px-2 py-1 rounded-md ${
                              item.priority === "High"
                                ? "bg-red-500 text-white"
                                : item.priority === "Medium"
                                ? "bg-yellow-500 text-black"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            {item.priority}
                          </span>
                          <span
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Category: {item.category}
                          </span>
                          <div
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Tags: {item.tags.join(", ")}
                          </div>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => toggleTimer(item.id)}
                            className="px-3 py-1 rounded-md bg-purple-500 hover:bg-purple-600 text-white transition duration-300 shadow-md"
                          >
                            {activeTimers[item.id]
                              ? "Hide Timer"
                              : "Show Timer"}
                          </button>
                          {activeTimers[item.id] && (
                            <PomodoroTimer
                              onTimerComplete={() =>
                                handleTimerComplete(item.id)
                              }
                            />
                          )}
                        </div>
                        {item.description && (
                          <div className="mt-2">
                            <h4 className="font-semibold">Description:</h4>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: item.description,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </>
    );
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className={`space-y-4 p-6 rounded-lg shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item" className="block text-sm font-medium mb-1">
                New Item
              </label>
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                id="item"
                className={`w-full p-2 rounded-md border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium mb-1"
              >
                Due Date
              </label>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                className={`w-full p-2 rounded-md border   ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="Select a date"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-1"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full p-2 rounded-md border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium mb-1"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full p-2 rounded-md border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={`w-full p-2 rounded-md border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>
          {/* Rich Text Editor for Task Description */}
          <div className="relative z-0">
            {" "}
            {/* Add relative positioning and lower z-index */}
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Editor
              apiKey="tdr7966j0zlc5yisfa0szvmdpklyo9f2rb5cwa2oaypjv4n4"
              initialValue=""
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "anchor",
                  "autolink",
                  "charmap",
                  "codesample",
                  "emoticons",
                  "image",
                  "link",
                  "lists",
                  "media",
                  "searchreplace",
                  "table",
                  "visualblocks",
                  "wordcount",
                  "checklist",
                  "mediaembed",
                  "casechange",
                  "export",
                  "formatpainter",
                  "pageembed",
                  "a11ychecker",
                  "tinymcespellchecker",
                  "permanentpen",
                  "powerpaste",
                  "advtable",
                  "advcode",
                  "editimage",
                  "advtemplate",
                  "ai",
                  "mentions",
                  "tinycomments",
                  "tableofcontents",
                  "footnotes",
                  "mergetags",
                  "autocorrect",
                  "typography",
                  "inlinecss",
                  "markdown",
                ],
                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                  "link image media table mergetags | addcomment showcomments | " +
                  "spellcheckdialog a11ycheck typography | align lineheight | " +
                  "checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                tinycomments_mode: "embedded",
                tinycomments_author: "Author name",
                mergetags_list: [
                  { value: "First.Name", title: "First Name" },
                  { value: "Email", title: "Email" },
                ],
                ai_request: (request, respondWith) =>
                  respondWith.string(() =>
                    Promise.reject("See docs to implement AI Assistant")
                  ),
              }}
              onEditorChange={(content) => setTaskDescription(content)}
            />
          </div>
          );
          <button
            className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
            type="submit"
            disabled={!newItem.trim()}
          >
            Add
          </button>
        </form>

        {/* Task Templates */}
        <div
          className={`mt-4 p-4 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">Task Templates</h3>
          <select
            onChange={(e) => {
              const template = taskTemplates.find(
                (t) => t.id === parseInt(e.target.value)
              );
              if (template) {
                applyTemplate(template);
              }
            }}
            className={`w-full p-2 rounded-md border ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          >
            <option value="">Select a template</option>
            {taskTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters and Search */}
        <div
          className={`mt-4 p-4 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setCurrentFilter("All")}
              className={`px-3 py-1 rounded-md ${
                currentFilter === "All"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCurrentFilter(category)}
                className={`px-3 py-1 rounded-md ${
                  currentFilter === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
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
            className={`w-full p-2 rounded-md border ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
          />
        </div>

        {/* Task List */}
        <div
          className={`mt-4 p-4 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">
            {showArchived ? "Archived Tasks" : "Current Tasks"}
          </h2>
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={toggleShowArchived}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
              {showArchived ? "Show Current Tasks" : "Show Archived Tasks"}
            </button>
            <div>
              <button
                onClick={sortByDueDate}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 mr-2"
              >
                Sort by Due Date
              </button>
              <button
                onClick={archiveCompleted}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300"
              >
                Archive Completed
              </button>
            </div>
          </div>
          {renderFilteredItems()}
        </div>

        {/* Category Management */}
        <div
          className={`mt-4 p-4 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">Manage Categories</h3>
          <form onSubmit={addCategory} className="mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className={`w-full p-2 rounded-md border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              } mb-2`}
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Add Category
            </button>
          </form>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex justify-between items-center">
                <span>{category}</span>
                <button
                  onClick={() => deleteCategory(category)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-md ${
              theme === "dark"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-800 text-white"
            } transition duration-300`}
          >
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}
