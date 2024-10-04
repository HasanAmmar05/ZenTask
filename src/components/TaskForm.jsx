import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Editor } from '@tinymce/tinymce-react';
import 'react-datepicker/dist/react-datepicker.css';

function TaskForm({ categories, setItems, theme }) {
  const [newItem, setNewItem] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('Low');
  const [tags, setTags] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newItem.trim() || !selectedCategory) {
      alert('Please enter a new item and select a category.');
      return;
    }
    const newTaskItem = {
      id: Date.now(),
      name: newItem,
      isCompleted: false,
      category: selectedCategory,
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      description: taskDescription,
    };
    setItems(prevItems => [...prevItems, newTaskItem]);
    setNewItem('');
    setDueDate(null);
    setSelectedCategory('');
    setPriority('Low');
    setTags('');
    setTaskDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="item" className="block text-sm font-medium mb-1">New Task</label>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            id="item"
            className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date</label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
            className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
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
            className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
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
            className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
      </div>
      <div className="relative z-0">
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <Editor
          apiKey="tdr7966j0zlc5yisfa0szvmdpklyo9f2rb5cwa2oaypjv4n4"
          initialValue=""
          init={{
            height: 300,
            menubar: false,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount'
            ],
            toolbar: 'undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help'
          }}
          onEditorChange={(content) => setTaskDescription(content)}
        />
      </div>
      <button
        className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
        type="submit"
        disabled={!newItem.trim()}
      >
        Add
      </button>
    </form>
  );
}

export default TaskForm;