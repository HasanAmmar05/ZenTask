import React, { useState } from "react";
import "./index.css";

let nextId = 0;

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([]);

  const toggleComplete = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setItems((prevItems) => [
      ...prevItems,
      { id: nextId++, name: newItem, isCompleted: false, dueDate: dueDate }
    ]);

    setNewItem("");
    setDueDate("");
  };

  const sortByDueDate = () => {
    setItems([...items].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  const [categories, setCategories] = useState(['Work', 'Personal', 'Shopping']);

  return (
    <div className="app-container">
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
        <button className="btn" type="submit" disabled={!newItem.trim()}>
          Add
        </button>
      </form>

      <div className="list-header">
        <h1 className="header">TO-DO List</h1>
        <button className="btn btn-secondary" onClick={sortByDueDate}>Sort by Due Date</button>
      </div>

      <ul className="list">
        {items.map((item) => (
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
                {item.name} - Due: {item.dueDate}
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
    </div>
  );
}