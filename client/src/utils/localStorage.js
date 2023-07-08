
// Find saved books, return empty array if none
export function getSavedBookIds() {
  const savedBookIds = localStorage.getItem('saved_books');

  if (!savedBookIds) {
    return [];
  }

  try {
    return JSON.parse(savedBookIds);
  } catch (err) {
    console.error('Error parsing saved book IDs from local storage', err);
    return [];
  }
}




// Save book ids to local storage
export const saveBookIds = (bookIdArr) => {
  if (bookIdArr.length) {
    localStorage.setItem('saved_books', JSON.stringify(bookIdArr));
  } else {
    localStorage.removeItem('saved_books');
  }
};

// Remove saved book ids from local storage
export const removeBookId = (bookId) => {
  const savedBookIds = localStorage.getItem('saved_books')
    ? JSON.parse(localStorage.getItem('saved_books'))
    : null;

  if (!savedBookIds) {
    return false;
  }

  // Remove bookId from savedBookIds array
  const updatedSavedBookIds = savedBookIds?.filter((savedBookId) => savedBookId !== bookId);
  localStorage.setItem('saved_books', JSON.stringify(updatedSavedBookIds));

  return true;
};
