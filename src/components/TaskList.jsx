import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import PomodoroTimer from './PomodoroTimer';

function TaskList({ 
  items, 
  setItems, 
  archivedItems, 
  setArchivedItems, 
  showArchived, 
  setShowArchived, 
  currentFilter, 
  searchQuery, 
  theme 
}) {
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
      setArchivedItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const unarchiveItem = (id) => {
    const itemToUnarchive = archivedItems.find((item) => item.id === id);
    if (itemToUnarchive) {
      setItems((prevItems) => [...prevItems, itemToUnarchive]);
      setArchivedItems((prevArchived) => prevArchived.filter((item) => item.id !== id));
    }
  };

  const archiveCompleted = () => {
    const completedItems = items.filter((item) => item.isCompleted);
    setArchivedItems((prevArchived) => [...prevArchived, ...completedItems]);
    setItems((prevItems) => prevItems.filter((item) => !item.isCompleted));
  };

  const getFilteredItems = () => {
    let itemsToFilter = showArchived ? archivedItems : items;

    if (currentFilter !== 'All') {
      itemsToFilter = itemsToFilter.filter((item) => item.category === currentFilter);
    }

    return itemsToFilter.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredItems = getFilteredItems();

  return (
    <div className={`mt-4 p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-4">{showArchived ? 'Archived Tasks' : 'Current Tasks'}</h2>
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          {showArchived ? 'Show Current Tasks' : 'Show Archived Tasks'}
        </button>
        {!showArchived && (
          <button
            onClick={archiveCompleted}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300"
          >
            Archive Completed
          </button>
        )}
      </div>
      <Droppable droppableId="list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {filteredItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-4 mb-4 rounded-lg shadow-md ${
                      theme === 'dark'
                        ? item.isCompleted
                          ? 'bg-gray-700'
                          : 'bg-gray-800'
                        : item.isCompleted
                        ? 'bg-green-100'
                        : 'bg-white'
                    } ${snapshot.isDragging ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {item.name}
                      </h3>
                      <div className="space-x-2">
                        <button
                          onClick={() => toggleComplete(item.id, showArchived)}
                          className={`px-3 py-1 rounded-md ${
                            item.isCompleted
                              ? 'bg-gray-500 hover:bg-gray-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          } text-white transition duration-300`}
                        >
                          {item.isCompleted ? 'Undo' : 'Complete'}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id, showArchived)}
                          className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white transition duration-300"
                        >
                          Delete
                        </button>
                        {showArchived && (
                          <button
                            onClick={() => unarchiveItem(item.id)}
                            className="px-3 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white transition duration-300"
                          >
                            Unarchive
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded-md ${
                        item.priority === 'High'
                          ? 'bg-red-500 text-white'
                          : item.priority === 'Medium'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-green-500 text-white'
                      }`}>
                        {item.priority}
                      </span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Category: {item.category}
                      </span>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Tags: {item.tags.join(', ')}
                      </div>
                    </div>
                    {item.description && (
                      <div className="mt-2">
                        <h4 className="font-semibold">Description:</h4>
                        <div dangerouslySetInnerHTML={{ __html: item.description }} />
                      </div>
                    )}
                    <div className="mt-2">
                      <PomodoroTimer onTimerComplete={() => console.log(`Timer completed for task ${item.id}`)} />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default TaskList;