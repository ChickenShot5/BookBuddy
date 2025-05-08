import React from "react";

export default function BookList({ books }) {
  return (
    <div>
      <h2>Books Available</h2>
      {books.length === 0 ? (
        <p>No books listed yet.</p>
      ) : (
        <ul>
          {books.map(book => (
            <li key={book.id}>
              <strong>{book.title}</strong> by {book.author}<br />
              <em>{book.description}</em><br />
              Condition: {book.condition}<br />
              Location: {book.location}<br />
              Contact: {book.contact}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
