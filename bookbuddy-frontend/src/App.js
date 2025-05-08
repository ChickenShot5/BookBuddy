import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    content: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [readBook, setReadBook] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      setAuth(true);
      fetchBooks();
    }
  }, [token]);

  const fetchBooks = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books`);
    const data = await res.json();
    setBooks(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${process.env.REACT_APP_API_URL}/api/books/${editingId}`
      : `${process.env.REACT_APP_API_URL}/api/books`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await fetchBooks();
      setForm({ title: "", author: "", description: "", content: "" });
      setEditingId(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setAuth(true);
      setMessage("Logged in successfully");
    } else {
      setMessage(data.error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("User created successfully. You can now log in.");
    } else {
      setMessage(data.error);
    }
  };

  const handleEdit = (book) => {
    setForm(book);
    setEditingId(book.id);
  };

  const handleDelete = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBooks(books.filter((b) => b.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setAuth(false);
    setUsername("");
    setPassword("");
    setMessage("You have logged out.");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📚 BookBuddy</h1>
        {auth && (
          <div className="user-controls">
            <span className="username">Welcome, {username}</span>
            <button className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>

      {!auth ? (
        <div>
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Sign Up</button>
          </form>

          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div>
          <h3>{editingId ? "Edit Book" : "Post a Book"}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="author"
              placeholder="Author"
              value={form.author}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Short Description"
              value={form.description}
              onChange={handleChange}
              required
            />
            <textarea
              name="content"
              placeholder="Full Book Content"
              value={form.content}
              onChange={handleChange}
              rows={6}
              required
            />
            <button type="submit">
              {editingId ? "Update Book" : "Post Book"}
            </button>
          </form>

          <h2>Available Books</h2>
          <ul>
            {books.map((book) => (
              <li key={book.id}>
                <strong>{book.title}</strong> by {book.author}
                <br />
                <em>{book.description}</em>
                <br />
                <button onClick={() => setReadBook(book)}>📖 Read</button>
                <button onClick={() => handleEdit(book)}>✏️ Edit</button>
                <button onClick={() => handleDelete(book.id)}>🗑️ Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {readBook && (
        <div className="modal">
          <div className="modal-content">
            <h2>{readBook.title}</h2>
            <h4>by {readBook.author}</h4>
            <p>{readBook.content}</p>
            <button onClick={() => setReadBook(null)}>Close</button>
          </div>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
