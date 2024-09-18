import React, { useState } from "react";
import "./index.css";

let nextId = 0;

export default function App() {
  const [NewItem, setNewItem] = useState("");
  const [items, setItems] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setItems((prevItems) => [...prevItems, { id: nextId++, name: NewItem }]);

    setNewItem("");
  };

  return (
    <>
      <form className="new-item-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="item">New Item</label>
          <input
            value={NewItem}
            onChange={(e) => setNewItem(e.target.value)}
            id="item"
          ></input>
        </div>
        <button className="btn" type="submit" disabled={!NewItem.trim()}>
          Add
        </button>
      </form>

      <h1 className="header"> TO-DO List</h1>
      <ul className="list">
        {items.map((item) => (
          <li key={item.id}>
            
            <label>
              <input type="checkbox" /> {item.name}
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
    </>
  );
}
