import { Suspense } from "react";
import type { ThreeElements } from "@react-three/fiber";
import BookshelfModel from "./Bookshelf";
import Book from "./Book";

interface ShelfBook {
  id: string;
  title: string;
  cover: string;
  position: [number, number, number];
}

const BOOKS: ShelfBook[] = [
  { id: "nature", title: "Nature", cover: "/bookshelf/book1.webp", position: [1, -0.03, -0.2] },
  { id: "Gitanjali", title: "Gitanjali", cover: "/bookshelf/book4.webp", position: [-1, 2.42, -0.2] },
  { id: "food", title: "Food", cover: "/bookshelf/book3.webp", position: [0, 1.2, -0.2] },
  { id: "Srija_Snigdha", title: "Srija Snigdha", cover: "/bookshelf/book2.webp", position: [-1, -0.03, -0.2] },
  { id: "Gitanjali", title: "Gitanjali", cover: "/bookshelf/book5.webp", position: [1, 2.42, -0.2] },
  { id: "Srija_Snigdha", title: "Srija Snigdha", cover: "/bookshelf/book2.webp", position: [0, -1.23, -0.2] },
];

type BookshelfProps = ThreeElements["group"] & {
  onBookClick: (bookName: string) => void;
};

export function Bookshelf({ onBookClick, ...props }: BookshelfProps) {
  return (
    <group {...props}>
      <Suspense fallback={null}>
        <BookshelfModel rows={5} width={4.5} height={6.5} />
        {BOOKS.map((book, i) => (
          <Book key={`${book.id}-${i}`} position={book.position} coverUrl={book.cover} title={book.title} onClick={() => onBookClick(book.id)} />
        ))}
      </Suspense>
    </group>
  );
}
