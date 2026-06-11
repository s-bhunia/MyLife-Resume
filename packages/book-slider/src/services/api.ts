// src/services/api.ts

interface Language {
  id: number;
  pictures: string[];
}

interface BookData {
  languages: Language[];
}

export type PicturesByLanguageMap = Record<number, string[]>;

export const fetchBookData = async (bookName: string): Promise<BookData> => {
  // FUTURE API CALL:
  // const url = `https://api.yourdomain.com/books/${bookName}/pages`;
  
  // CURRENT LOCAL JSON CALL: 
  // Expects a file at public/book-slider/books/[bookName]/[bookName].json
  const url = `/book-slider/books/${bookName}/${bookName}.json`; 

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: BookData = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to load data for book: ${bookName}`, error);
    return { languages: [] };
  }
};