import React from 'react';
import { createRoot } from 'react-dom/client';
import BookshelfScene from '../BookshelfScene';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BookshelfScene />
  </React.StrictMode>
);


