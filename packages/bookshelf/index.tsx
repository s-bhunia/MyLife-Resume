import React, { Suspense, useState } from "react";
import BookshelfModel from "./Bookshelf";
import Book from "./Book";

export function Bookshelf(props) {
  const [books, setBooks] = useState([
    // Row 1 (Bottom shelf)
    {
      id: 1,
      position: [-1, 2.42, -0.2] as [number, number, number],
      coverUrl: "/bookshelf/book1.jpg",
    },
    {
      id: 2,
      position: [1, 2.42, -0.2] as [number, number, number],
      coverUrl: "/bookshelf/book2.jpg",
    },
    // Row 2
    {
      id: 3,
      position: [0, 1.2, -0.2] as [number, number, number],
      coverUrl: "/bookshelf/book3.jpg",
    },
    // {
    //   id: 3,
    //   position: [0, 1.2, -0.2] as [number, number, number],
    //   coverUrl: "/book3.jpg",
    // },
    // Row 3
    {
      id: 4,
      position: [1, -0.03, -0.2] as [number, number, number],
      coverUrl: "/bookshelf/book4.jpg",
    },
    {
      id: 4,
      position: [-1, -0.03, -0.2] as [number, number, number],
      coverUrl: "/bookshelf/book4.jpg",
    },
    {
      id: 4,
      position: [0, -1.23, -0.2] as [number, number, number],
      coverUrl: "/bookshelf/book5.jpg",
    },
  ]);

  return (
    <group {...props}>
      {/* Suspense waits for both the plywood and book textures to load */}
      <Suspense fallback={null}>
        <BookshelfModel rows={5} width={4.5} height={6.5} />

        {/* Map through the state to render the books */}
        {books.map((book) => (
          <Book
            key={book.id}
            position={book.position}
            coverUrl={book.coverUrl}
            onClick={() => {
              alert(`Opening 3D viewer for ${book.coverUrl}...`);
            }}
          />
        ))}
      </Suspense>
    </group>
  );
}
