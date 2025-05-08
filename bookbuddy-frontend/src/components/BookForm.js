import React, { useState } from "react";

export default function BookForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    condition: "",
    location: "",
    contact: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${process.env.REACT_APP_API_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    onAdd({ id: data.id, ...form });

    setForm({
      title: "",
      author: "",
      description: "",
      condition: "",
      location: "",
      contact: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <input
        name="author"
        placeholder="Author"
        value={form.author}
        onChange={handleChange}
        required
      />
      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input
        name="condition"
        placeholder="Condition"
        value={form.condition}
        onChange={handleChange}
      />
      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
      />
      <input
        name="contact"
        placeholder="Contact"
        value={form.contact}
        onChange={handleChange}
      />
      <button type="submit">Add Book</button>
    </form>
  );
}
