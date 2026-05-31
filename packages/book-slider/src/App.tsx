import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

function App(): React.ReactNode {
  const [selectedBook, setSelectedBook] = useState("Gitanjali");

  const availableBooks = ["Gitanjali", "Srija_Snigdha"];

  return (
    <>
      {/* Book Selector */}
      <div style={{
        position: "fixed",
        top: 10,
        left: 10,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.7)",
        padding: "10px 15px",
        borderRadius: "8px",
        color: "white",
        fontFamily: "sans-serif"
      }}>
        <label style={{ marginRight: "10px" }}>Select Book:</label>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          {availableBooks.map((book) => (
            <option key={book} value={book}>
              {book}
            </option>
          ))}
        </select>
      </div>

      <UI bookName={selectedBook} onClose={() => {}} />
      <Loader />
      <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience bookName={selectedBook} />
          </Suspense>
        </group>
      </Canvas>
    </>
  );
}

export default App;
