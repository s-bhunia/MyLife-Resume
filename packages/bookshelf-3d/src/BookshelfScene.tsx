import Book from "./Book";
import FrontFacingBook from "./FrontFacingBook";

const BookshelfScene = () => {
  const books = [
    {
      title: "React Master",
      color: "#61dafb",
      pos: [-1.5, 0, 0] as [number, number, number],
    },
    {
      title: "Three.js Guide",
      color: "#ff4081",
      pos: [-0.5, 0, 0] as [number, number, number],
    },
    {
      title: "Node.js Logic",
      color: "#43853d",
      pos: [0.5, 0, 0] as [number, number, number],
    },
  ];

  return (
    <group>
      {/* The Physical Shelf Structure */}
      <mesh receiveShadow position={[0, -0.8, 0]}>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial color="#2d1b0d" />
      </mesh>

      {/* Rendered Books */}
      {books.map((book, i) => (
        <Book
          key={i}
          title={book.title}
          color={book.color}
          position={book.pos}
        />
      ))}

      {/* Featured Book */}
      <FrontFacingBook
        title="Featured Selection"
        position={[0, 1.5, -0.5]}
        color="#e67e22"
      />
    </group>
  );
};

export default BookshelfScene;
