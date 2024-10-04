import React, { useState } from 'react';

function CategoryManager({ categories, setCategories, items, setItems, theme }) {
  const [newCategory, setNewCategory] = useState('');

  const addCategory = (event) => {
    event.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const deleteCategory = (categoryToDelete) => {
    setCategories(categories.filter((category) => category !== categoryToDelete));
    setItems(
      items.map((item) =>
        item.category === categoryToDelete ? { ...item, category: '' } : item
      )
    );
  };

  return (
    <div className={`mt-4 p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className="text-lg font-semibold mb-2">Manage Categories</h3>
      <form onSubmit={addCategory} className="mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className={`w-full p-2 rounded-md border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
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
  );
}

export default CategoryManager;