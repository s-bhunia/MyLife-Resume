import { Suspense, useState } from "react";
import BookshelfModel from "./Bookshelf";
import Book from "./Book";

// Book name mapping - maps cover URLs to book names
const BOOK_NAME_MAP: { [key: string]: string } = {
  "./bookshelf/book1.jpg": "Gitanjali",
  "./bookshelf/book2.jpg": "Srija_Snigdha",
  "./bookshelf/book3.jpg": "Gitanjali",
  "./bookshelf/book4.jpg": "Gitanjali",
  "./bookshelf/book5.jpg": "Gitanjali",
};

interface BookshelfProps {
  onBookClick?: (bookName: string) => void;
  [key: string]: any;
}

export function Bookshelf({ onBookClick, ...props }: BookshelfProps) {
  const [books] = useState([
    // Row 1 (Bottom shelf)
    {
      id: 1,
      position: [-1, 2.42, -0.2] as [number, number, number],
      coverUrl: "./bookshelf/book1.jpg",
    },
    {
      id: 2,
      position: [1, 2.42, -0.2] as [number, number, number],
      coverUrl: "./bookshelf/book2.jpg",
    },
    // Row 2
    {
      id: 3,
      position: [0, 1.2, -0.2] as [number, number, number],
      coverUrl: "./bookshelf/book3.jpg",
    },
    // Row 3
    {
      id: 4,
      position: [1, -0.03, -0.2] as [number, number, number],
      coverUrl: "./bookshelf/book4.jpg",
    },
    {
      id: 5,
      position: [-1, -0.03, -0.2] as [number, number, number],
      coverUrl: "./bookshelf/book4.jpg",
    },
    {
      id: 6,
      position: [0, -1.23, -0.2] as [number, number, number],
      coverUrl: "./bookshelf/book5.jpg",
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
              const bookName = BOOK_NAME_MAP[book.coverUrl] || book.coverUrl;
              if (onBookClick) {
                onBookClick(bookName);
              }
            }}
          />
        ))}
      </Suspense>
    </group>
  );
}
